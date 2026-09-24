# Cost Analysis

For a real request, estimated cost is calculated as:

```text
(input tokens × input rate + output tokens × output rate
 + cache-write tokens × cache-write rate + cache-read tokens × cache-read rate) / 1,000,000
```

Rates are configured locally. If any rate is unavailable, the application records cost as unknown rather than inventing a provider price. An unset rate is unknown; it is not zero or free.

## Illustrative Estimate - Not Actual Usage

| Scenario | Input | Output | Cache write | Cache read | Configured rate/million | Projected cost |
|---|---:|---:|---:|---:|---:|---:|
| Illustrative request | 1,000 | 400 | 0 | 0 | Not configured | Unknown |

This is offline documentation only. Actual costs require returned token usage and real environment-configured prices. `npm run report` calculates totals from real metrics when available.
