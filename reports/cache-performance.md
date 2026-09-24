# Cache Performance Strategy

The agent keeps its system prompt and tool definitions stable between equivalent requests. For an Anthropic-compatible endpoint, those stable request parts retain Anthropic `cache_control` annotations and may participate in native caching only if the endpoint supports it.

SharedLLM OpenAI-compatible mode translates Messages requests to Chat Completions and removes unsupported `cache_control` fields. Stable prompts and schemas remain an application-level prompt-stability practice, not cache-hit evidence.

## Projected - Not Runtime Tested

| Scenario | Stable payload | Cache-read tokens | Cache-hit rate |
|---|---|---:|---:|
| First request | Included | Not measured | Not measured |
| Repeated native Anthropic-compatible request | Included unchanged | Not measured | Not measured |
| Repeated SharedLLM OpenAI-compatible request | Included unchanged | 0 by adapter design | Not applicable |

To measure a required rate greater than 70% in a real run, send identical stable requests to an endpoint that returns native cache usage fields, save real metrics, and run `npm run report`.

```text
cache-hit rate = requests with cache_read_input_tokens > 0 / total repeated requests × 100
```

Only provider-returned usage fields can establish that rate.
