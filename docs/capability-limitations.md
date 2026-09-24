# Capability Limitations

| Capability | Anthropic-compatible endpoint | SharedLLM OpenAI-compatible mode | Offline status |
|---|---|---|---|
| Messages API | Native | Translated to Chat Completions | Implementation reviewed only |
| Tool use | Native blocks when supported | Translated to/from function tools | Not runtime-tested |
| Structured output | Application-level Zod validation | Application-level Zod validation | Not runtime-tested |
| Extended thinking | Native only when provider supports it | Unavailable; unsupported field removed | No native evidence |
| Prompt caching | Native only when provider supports it | Unavailable; `cache_control` removed | No native evidence |
| Token tracking | Native usage when returned | Normalized from prompt/completion tokens | Not runtime-tested |
| Cost estimation | Application-level configured-rate calculation | Application-level configured-rate calculation | Projected when usage/rates unavailable |

OpenAI-compatible mode cannot honestly demonstrate native Anthropic extended thinking or native Anthropic prompt-cache metrics. The adapter does not create provider capabilities the endpoint does not return.
