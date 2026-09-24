import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { config } from "./config.js";
import { executeTool, tools } from "./tools.js";
import { addUsage, emptyUsage, estimateCost, saveMetric } from "./metrics.js";
import { createSharedLlmCompatibilityFetch } from "./sharedllm-adapter.js";

const finalAnswerSchema = z.object({
  answer: z.string(),
  key_findings: z.array(z.string()),
  sources: z.array(z.object({ title: z.string(), url: z.string().optional() })),
  confidence: z.enum(["low", "medium", "high"]),
  limitations: z.array(z.string())
});

const systemPrompt = `You are a careful research assistant. Use tools when evidence is needed.
Return the final answer as JSON only with this shape:
{"answer":"...","key_findings":["..."],"sources":[{"title":"...","url":"..."}],"confidence":"low|medium|high","limitations":["..."]}
Never invent sources. Clearly state limitations when evidence is incomplete.`;

export async function research(question: string) {
  if (config.SHARED_LLM_PROTOCOL === "auto") {
    throw new Error("Run `npm run probe`, then set SHARED_LLM_PROTOCOL to anthropic or openai in .env.");
  }
  const client = new Anthropic({
    apiKey: config.SHARED_LLM_API_KEY,
    // The Anthropic SDK appends /v1/messages itself. SharedLLM's OpenAI-style
    // base commonly ends in /v1, so remove that suffix for direct Messages use.
    baseURL: config.SHARED_LLM_PROTOCOL === "anthropic" ? anthropicSdkBaseURL(config.SHARED_LLM_BASE_URL) : "https://sharedllm-adapter.local",
    ...(config.SHARED_LLM_PROTOCOL === "openai" ? {
      fetch: createSharedLlmCompatibilityFetch({ baseURL: config.SHARED_LLM_BASE_URL, apiKey: config.SHARED_LLM_API_KEY })
    } : {})
  });
  const messages: Anthropic.Messages.MessageParam[] = [{ role: "user", content: question }];
  const totals = emptyUsage();
  const invokedTools: string[] = [];
  let finalText = "";
  let turns = 0;

  for (; turns < config.MAX_AGENT_TURNS; turns += 1) {
    const response = await client.messages.create({
      model: config.MODEL_NAME,
      max_tokens: config.MAX_OUTPUT_TOKENS,
      thinking: { type: "enabled", budget_tokens: config.THINKING_BUDGET_TOKENS },
      system: [{ type: "text", text: systemPrompt, cache_control: { type: "ephemeral" } }],
      tools,
      messages
    });

    addUsage(totals, response.usage as unknown as Record<string, unknown>);
    messages.push({ role: "assistant", content: response.content });
    const toolUses = response.content.filter(block => block.type === "tool_use");
    const textBlocks = response.content.filter(block => block.type === "text");
    finalText = textBlocks.map(block => block.text).join("\n").trim();

    if (response.stop_reason !== "tool_use" || toolUses.length === 0) break;

    const results: Anthropic.Messages.ToolResultBlockParam[] = [];
    for (const toolUse of toolUses) {
      invokedTools.push(toolUse.name);
      try {
        const output = await executeTool(toolUse.name, toolUse.input);
        results.push({ type: "tool_result", tool_use_id: toolUse.id, content: JSON.stringify(output) });
      } catch (error) {
        results.push({
          type: "tool_result",
          tool_use_id: toolUse.id,
          is_error: true,
          content: error instanceof Error ? error.message : String(error)
        });
      }
    }
    messages.push({ role: "user", content: results });
  }

  const parsed = finalAnswerSchema.safeParse(JSON.parse(stripCodeFence(finalText)));
  if (!parsed.success) throw new Error(`Final response was not valid structured JSON: ${parsed.error.message}`);

  const estimatedCostUsd = estimateCost(totals, config);
  const cacheHit = totals.cacheReadTokens > 0;
  const metric = {
    timestamp: new Date().toISOString(), question, turns: turns + 1,
    invoked_tools: invokedTools, usage: totals, cache_hit: cacheHit, estimated_cost_usd: estimatedCostUsd,
    provider_protocol: config.SHARED_LLM_PROTOCOL,
    native_prompt_caching: config.SHARED_LLM_PROTOCOL === "anthropic" ? "not_verified" : "unavailable",
    native_extended_thinking: config.SHARED_LLM_PROTOCOL === "anthropic" ? "not_verified" : "unavailable"
  };
  await saveMetric(metric);
  return { result: parsed.data, metric };
}

function stripCodeFence(text: string) {
  return text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
}

function anthropicSdkBaseURL(url: string) {
  return url.replace(/\/v1\/?$/, "");
}
