# Architecture

```mermaid
flowchart TD
    U[Research question] --> A[Agent loop]
    A --> S[Official Anthropic SDK]
    S --> C[Local SharedLLM compatibility adapter]
    C --> G[SharedLLM OpenAI Chat Completions endpoint]
    G --> C --> S --> A
    A --> W[web_search] --> WS[Wikipedia]
    A --> K[knowledge_lookup] --> KB[Local knowledge base]
    A --> D[research_db_query] --> DB[Local research dataset]
    W --> A
    K --> A
    D --> A
    A --> J[Zod-validated structured JSON]
    A --> M[Usage and cost metrics]
```

The official Anthropic SDK remains the application interface. The local adapter is used only for the documented OpenAI-compatible SharedLLM gateway: it translates request, tool, tool-result, and usage shapes. Structured validation and cost estimation are application-level features. Native Anthropic thinking and prompt-cache behavior are not claimed in OpenAI-compatible mode.
