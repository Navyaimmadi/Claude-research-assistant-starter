/**
 * A local transport adapter. The application continues to use the official
 * Anthropic SDK; only its HTTP Messages request/response is translated to an
 * OpenAI-compatible SharedLLM Chat Completions request/response.
 */
import type Anthropic from "@anthropic-ai/sdk";

type Json = Record<string, unknown>;
type OpenAiToolCall = { id?: string; type?: string; function?: { name?: string; arguments?: string } };

export function createSharedLlmCompatibilityFetch(options: { baseURL: string; apiKey: string }): typeof fetch {
  const endpoint = `${options.baseURL.replace(/\/$/, "")}/chat/completions`;

  return async (_input, init) => {
    const anthropicRequest = JSON.parse(String(init?.body ?? "{}")) as Json;
    const sharedRequest = anthropicToOpenAi(anthropicRequest);
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-sharedllm-key": options.apiKey
      },
      body: JSON.stringify(sharedRequest)
    });

    const rawText = await response.text();
    if (!response.ok) {
      // Keep provider errors intact, but never include the Authorization header.
      return new Response(rawText, { status: response.status, headers: { "content-type": response.headers.get("content-type") ?? "application/json" } });
    }
    let completion: Json;
    try {
      completion = JSON.parse(rawText) as Json;
    } catch {
      return new Response(JSON.stringify({ error: { message: "SharedLLM returned non-JSON content." } }), { status: 502, headers: { "content-type": "application/json" } });
    }
    return new Response(JSON.stringify(openAiToAnthropic(completion, anthropicRequest.model)), {
      status: 200,
      headers: { "content-type": "application/json" }
    });
  };
}

export function anthropicToOpenAi(request: Json): Json {
  const system = textFromContent(request.system);
  const messages = Array.isArray(request.messages) ? request.messages.flatMap(messageToOpenAi) : [];
  const tools = Array.isArray(request.tools)
    ? request.tools.map(tool => {
      const source = tool as Json;
      return { type: "function", function: { name: source.name, description: source.description, parameters: source.input_schema } };
    })
    : undefined;
  return {
    model: request.model,
    max_tokens: request.max_tokens,
    ...(system ? { messages: [{ role: "system", content: system }, ...messages] } : { messages }),
    ...(tools?.length ? { tools, tool_choice: "auto" } : {})
    // Anthropic thinking and cache_control have no OpenAI-compatible equivalent.
  };
}

function messageToOpenAi(message: unknown): Json[] {
  const item = (message ?? {}) as Json;
  const role = String(item.role ?? "user");
  if (!Array.isArray(item.content)) return [{ role, content: item.content ?? "" }];
  const blocks = item.content as Json[];
  if (role === "user") {
    const toolResults = blocks.filter(block => block.type === "tool_result");
    const text = blocks.filter(block => block.type === "text").map(block => String(block.text ?? "")).join("\n");
    return [
      ...(text ? [{ role: "user", content: text }] : []),
      ...toolResults.map(block => ({ role: "tool", tool_call_id: block.tool_use_id, content: textFromContent(block.content) }))
    ];
  }
  const text = blocks.filter(block => block.type === "text").map(block => String(block.text ?? "")).join("\n");
  const toolCalls = blocks.filter(block => block.type === "tool_use").map(block => ({
    id: block.id,
    type: "function",
    function: { name: block.name, arguments: JSON.stringify(block.input ?? {}) }
  }));
  return [{ role: "assistant", content: text || null, ...(toolCalls.length ? { tool_calls: toolCalls } : {}) }];
}

export function openAiToAnthropic(completion: Json, model: unknown): Json {
  const choice = ((completion.choices as Json[] | undefined) ?? [])[0] ?? {};
  const message = (choice.message ?? {}) as Json;
  const toolCalls = (message.tool_calls as OpenAiToolCall[] | undefined) ?? [];
  const content: Json[] = [];
  if (typeof message.content === "string" && message.content.trim()) content.push({ type: "text", text: message.content });
  for (const call of toolCalls) {
    const args = call.function?.arguments ?? "{}";
    let input: unknown = {};
    try { input = JSON.parse(args); } catch { input = {}; }
    content.push({ type: "tool_use", id: call.id ?? crypto.randomUUID(), name: call.function?.name ?? "unknown", input });
  }
  const usage = (completion.usage ?? {}) as Json;
  return {
    id: String(completion.id ?? crypto.randomUUID()), type: "message", role: "assistant", model: String(completion.model ?? model),
    content: content.length ? content : [{ type: "text", text: "" }],
    stop_reason: toolCalls.length ? "tool_use" : "end_turn", stop_sequence: null,
    usage: { input_tokens: Number(usage.prompt_tokens ?? 0), output_tokens: Number(usage.completion_tokens ?? 0) }
  };
}

function textFromContent(content: unknown): string {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content.map(block => {
    const item = block as Json;
    return item.type === "text" ? String(item.text ?? "") : typeof item.text === "string" ? item.text : "";
  }).filter(Boolean).join("\n");
}
