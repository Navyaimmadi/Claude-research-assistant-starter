# Work Remaining Before Submission

- [ ] Run `npm install`.
- [ ] Copy `.env.example` to `.env` and add the shared values.
- [ ] Run `npm run probe` and record whether the SharedLLM base URL is Anthropic- or OpenAI-compatible.
- [ ] Set `SHARED_LLM_PROTOCOL` to the verified protocol; OpenAI-compatible endpoints use the local adapter.
- [ ] Confirm the chosen model supports tool use. Verify extended thinking and prompt caching independently; record them as unavailable if the provider does not return native evidence.
- [ ] Replace all four zero pricing values with the provider's actual prices.
- [x] Run `npm run typecheck` and fix any SDK-version differences.
- [ ] Run a simple question successfully.
- [ ] Run the demo and confirm all three tools are invoked across the evidence runs.
- [ ] Inspect `metrics/requests.jsonl` for real cache read/write tokens.
- [ ] Repeat stable queries until the measured cache hit rate exceeds 70%.
- [ ] Run `npm run report`.
- [ ] Replace placeholder files under `outputs/` with sanitized real outputs.
- [ ] Review the architecture diagram against the final code.
- [ ] Confirm no `.env`, keys, private chain-of-thought, or sensitive data are committed.
- [ ] Create a public GitHub repository and submit its link.
