---
name: complete-research-assistant-lab
description: Continue and verify the Module 2 Claude-powered research assistant lab using the user's shared LLM gateway.
---

# Module 2 Research Assistant Lab Skill

## Purpose

Use this skill when continuing this repository with Codex. The attached assignment brief is authoritative. Do not invent provider capabilities, metrics, tool invocations, outputs, or costs.

## Required working rules

1. Read `README.md`, `TODO.md`, and all relevant source files before editing.
2. Preserve use of the official `@anthropic-ai/sdk` unless the instructor explicitly approves a different implementation.
3. Keep secrets only in `.env`. Never display or commit them.
4. Verify the shared gateway accepts Anthropic Messages requests before debugging application logic.
5. Verify tool use, `thinking`, `cache_control`, and cache usage fields independently.
6. If the selected non-Claude model or gateway does not support a required feature, stop and document the limitation. Do not simulate evidence.
7. Make small changes, run `npm run typecheck`, and then test the affected behavior.
8. Store raw run metrics in `metrics/requests.jsonl`; keep only sanitized representative outputs in Git.
9. Generate reports from real metrics with `npm run report`.
10. Before submission, ensure the README's claims match observed behavior.

## Completion workflow

1. Install dependencies and configure `.env`.
2. Send a minimal Messages API request through the configured gateway.
3. Run one simple query and fix protocol mismatches.
4. Run a query that naturally requires each of the three tools.
5. Run the complex demo query and confirm thinking was requested and accepted.
6. Repeat an identical query enough times to measure caching.
7. Check that cache hit rate exceeds 70%; if not, diagnose prompt stability and provider behavior.
8. Add real, sanitized output files and generate reports.
9. Complete `docs/architecture.md` if the implementation changes.
10. Run the final checklist in `TODO.md`, then publish to a public GitHub repository.

## Definition of done

The repository is done only when source code runs end-to-end, at least three tools are invoked, extended thinking is demonstrably enabled, caching is measured with a hit rate above 70% on repeated queries, cost tracking uses correct prices, structured JSON validates, and all required deliverables are committed without secrets.
