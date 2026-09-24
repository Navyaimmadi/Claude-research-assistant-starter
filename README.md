# Claude-Powered Research Assistant - Module 2 Starter

This repository is a Codex-ready starter for the Module 2 lab. It follows the attached brief: Anthropic SDK and Messages API, an agent loop, three tools, extended thinking, prompt caching, structured JSON output, usage metrics, and cost reporting.

## Important shared-LLM compatibility check

The course brief requires the **official Anthropic SDK and Claude Messages API**. A different model can be used through that SDK only if the shared gateway exposes an **Anthropic-compatible Messages endpoint**. A model name by itself is not enough.

Before running the project, ask the instructor/provider for:

1. The Anthropic-compatible base URL.
2. The API key.
3. The exact model name.
4. Confirmation that the endpoint returns Anthropic-style tool-use blocks.
5. Confirmation that it supports `thinking` and `cache_control`, including cache usage fields.
6. The provider's input, output, cache-write, and cache-read prices.

If their gateway supports only OpenAI-compatible requests, do not silently replace the SDK. Ask the instructor whether an adapter/proxy is permitted, because otherwise the lab's Anthropic SDK requirement and its cache/thinking measurements cannot be demonstrated honestly.

## What is already included

- Anthropic TypeScript SDK client with configurable `baseURL`
- Stable cached system prompt and cached tool definitions
- Agent loop: model requests tools, application returns results, model continues
- Three tools with JSON schemas:
  - `web_search`: Wikipedia search and page summaries
  - `knowledge_lookup`: local course/company knowledge file
  - `research_db_query`: safe lookup over a local research dataset
- Extended-thinking configuration with a dedicated token budget
- Zod-validated structured final output
- Per-turn and per-query token, cache, and estimated-cost logging
- Demo and report scripts
- Architecture diagram and submission checklist

## Setup on your Mac

```bash
unzip claude-research-assistant-starter.zip
cd claude-research-assistant-starter
npm install
cp .env.example .env
```

Open `.env` and replace every placeholder with values from your shared LLM provider. Do not paste your API key into source code, screenshots, sample outputs, or GitHub. `MODEL_NAME` defaults to `kimi-k2.7-code`; retain a configured different model if your course has assigned one.

Before running the assistant, determine the gateway protocol using a real minimal request:

```bash
npm run probe
```

Set `SHARED_LLM_PROTOCOL=anthropic` only when the Anthropic response shape is recognized. Set it to `openai` only when the OpenAI response shape is recognized. In OpenAI mode the application still calls the official Anthropic SDK; its local fetch adapter translates Messages requests, tool definitions, tool calls, tool results, and usage fields to/from Chat Completions.

The OpenAI adapter removes Anthropic `cache_control` and `thinking` fields because they are not native OpenAI-compatible fields. It reports cache and thinking as unavailable, leaves cache token metrics at zero, and does not claim extended-thinking evidence. The stable system prompt/tool definitions are retained as an application-level prompt-stability practice, not provider prompt caching.

Then run:

```bash
npm run typecheck
npm run dev -- "Compare retrieval-augmented generation and fine-tuning for a small support team. Use all available sources."
```

## How to continue with Codex

Open this folder in VS Code, open its terminal, and run `codex`. Paste this prompt:

> Read `SKILL.md` and `README.md` completely before changing anything. Work through `TODO.md` in order. Use only the shared LLM credentials in my local `.env`; never print or commit secrets. First run `npm install` and `npm run typecheck`. Then verify whether my shared endpoint is Anthropic Messages-compatible and supports tool use, thinking, and cache usage. Do not fake unsupported metrics or sample outputs. Help me run the demos, fix real errors, and update the deliverables using the actual results.

## Commands

```bash
npm run dev -- "your research question"
npm run demo
npm run report
npm run typecheck
```

`npm run demo` executes repeated queries so caching can be observed. `npm run report` reads `metrics/requests.jsonl` and rewrites the metrics and cost reports with real numbers.

## Evidence you must produce before submission

- Real sample outputs in `outputs/`
- At least one run in which all three tools are actually invoked
- One complex-query run showing extended-thinking usage (record the returned usage/config evidence; do not expose private chain-of-thought)
- Repeated runs showing cache read/write fields and a cache hit rate above 70%
- Actual provider prices and generated cost analysis
- A public GitHub repository link

See [TODO.md](TODO.md) for the exact completion sequence.
