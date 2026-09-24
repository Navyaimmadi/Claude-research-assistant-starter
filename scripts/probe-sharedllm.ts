import "dotenv/config";

const baseURL = process.env.SHARED_LLM_BASE_URL;
const apiKey = process.env.SHARED_LLM_API_KEY;
const model = process.env.MODEL_NAME || "kimi-k2.7-code";
if (!baseURL || !apiKey) throw new Error("Set SHARED_LLM_BASE_URL and SHARED_LLM_API_KEY in .env before probing.");

const root = baseURL.replace(/\/$/, "");
const headers = { "content-type": "application/json", "x-sharedllm-key": apiKey };
const attempts = [
  { protocol: "anthropic", url: `${root}/messages`, body: { model, max_tokens: 8, stream: false, messages: [{ role: "user", content: "Reply with OK." }] } },
  { protocol: "openai", url: `${root}/chat/completions`, body: { model, max_tokens: 8, stream: false, messages: [{ role: "user", content: "Reply with OK." }] } }
];

for (const attempt of attempts) {
  try {
    const response = await fetch(attempt.url, {
      method: "POST",
      headers: attempt.protocol === "anthropic" ? { ...headers, "anthropic-version": "2023-06-01" } : headers,
      body: JSON.stringify(attempt.body)
    });
    const rawBody = await response.text();
    const payload = (() => {
      try { return JSON.parse(rawBody) as Record<string, unknown>; } catch { return null; }
    })();
    const recognized = attempt.protocol === "anthropic" ? payload?.type === "message" : Array.isArray(payload?.choices);
    const providerError = payload?.error && typeof payload.error === "object" ? payload.error as Record<string, unknown> : undefined;
    const message = payload?.message && typeof payload.message === "object" ? payload.message as Record<string, unknown> : undefined;
    const firstChoice = Array.isArray(payload?.choices) && payload.choices[0] && typeof payload.choices[0] === "object" ? payload.choices[0] as Record<string, unknown> : undefined;
    console.log(JSON.stringify({
      protocol: attempt.protocol,
      http_status: response.status,
      recognized_response_shape: recognized,
      content_type: response.headers.get("content-type"),
      response_bytes: new TextEncoder().encode(rawBody).byteLength,
      json_parsed: payload !== null,
      response_keys: payload ? Object.keys(payload).sort() : [],
      ...(message ? { message_keys: Object.keys(message).sort() } : {}),
      ...(firstChoice ? { first_choice_keys: Object.keys(firstChoice).sort() } : {}),
      ...(providerError ? { provider_error: {
        type: typeof providerError.type === "string" ? providerError.type : undefined,
        code: typeof providerError.code === "string" ? providerError.code : undefined,
        message: typeof providerError.message === "string" ? providerError.message : undefined
      } } : {})
    }));
  } catch (error) {
    console.log(JSON.stringify({ protocol: attempt.protocol, error: error instanceof Error ? error.message : String(error) }));
  }
}
