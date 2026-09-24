# SharedLLM Research Assistant

This Module 2 project keeps the official Anthropic TypeScript SDK while using course-provided SharedLLM credits through a local OpenAI-compatible transport adapter. It provides Wikipedia search, a local knowledge base, a local research dataset, validated structured JSON, and usage metrics.

## How it works

The application creates Anthropic Messages calls with `@anthropic-ai/sdk`. In SharedLLM OpenAI-compatible mode, the local adapter translates Messages requests to Chat Completions, Anthropic tools to function tools, function calls to `tool_use` blocks, and tool results to OpenAI tool messages. It also normalizes returned token usage into application metrics. See [architecture](docs/architecture.md) and [capability limitations](docs/capability-limitations.md).

## Setup and usage

1. Run `npm install`.
2. Create a private `.env` from `.env.example` and enter your course-provided SharedLLM configuration. Never commit or share it.
3. Use the SharedLLM OpenAI gateway configuration, including its required `X-SharedLLM-Key` authentication header; the adapter supplies this header without exposing the key.
4. Select a model available to your course account and set the OpenAI protocol mode.

```bash
npm run typecheck
npm run dev -- "Compare retrieval-augmented generation and fine-tuning for a small support team. Use all available sources."
```

`npm run probe`, `npm run demo`, and normal assistant requests make provider/network calls. Run them only when ready to use course credits.

## Offline Review Status

This repository includes source code, projected reports, and illustrative offline examples. They are not evidence of a successful provider run. Runtime verification of endpoint compatibility, model availability, tool calls, structured output, usage, costs, caching, and thinking must be performed separately if required by a grader.

OpenAI-compatible mode removes unsupported Anthropic `thinking` and `cache_control` fields. It does not claim native Anthropic extended thinking or native prompt caching.

## Deliverable Status

| Deliverable | Status |
|---|---|
| Source code | Complete |
| Architecture diagram | Complete |
| Three tool definitions | Complete |
| Illustrative sample outputs | Complete but not runtime-tested |
| Cache strategy report | Complete with projected measurement plan |
| Cost report | Complete with illustrative calculations |
| Native extended-thinking evidence | Unavailable in OpenAI-compatible mode |
| Native prompt-cache evidence | Unavailable in OpenAI-compatible mode |

## Contents

- `src/` — agent, tools, configuration, metrics, and adapter
- `docs/` — architecture and capability limitations
- `outputs/` — sanitized illustrative examples, not runtime evidence
- `reports/` — projected cache and cost documentation
- `scripts/` — probe, demo, and report utilities
