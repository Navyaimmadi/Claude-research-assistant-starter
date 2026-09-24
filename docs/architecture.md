# Architecture

```mermaid
flowchart TD
    U[Research question] --> A[Agent loop]
    A --> S[Official Anthropic SDK]
    S -->|Anthropic-compatible gateway| M[Messages API]
    S -->|OpenAI-compatible gateway| C[Local compatibility adapter]
    C --> O[SharedLLM Chat Completions API]
    M -->|tool_use| A
    A --> W[Web search]
    A --> K[Knowledge lookup]
    A --> D[Research DB]
    W --> A
    K --> A
    D --> A
    M --> J[Validated JSON answer]
    A --> X[Usage and cost metrics]
```

The TypeScript application always sends Anthropic Messages calls through the official Anthropic SDK. After `npm run probe`, an Anthropic-compatible gateway is used directly. For an OpenAI-compatible SharedLLM gateway, a local SDK fetch transport maps Anthropic Messages requests to Chat Completions and converts function tool calls and token usage back to Anthropic-shaped blocks before the SDK receives them. Tool results are converted to OpenAI `role: tool` messages on the following turn.

OpenAI-compatible mode does not assert native support for Anthropic prompt caching or extended thinking: `cache_control` and `thinking` are not transmitted, cache token values remain zero, and metrics mark both capabilities unavailable. The stable prompt and tool schemas remain fixed between requests as an application-level prompt-stability equivalent, not a cache-hit claim.
