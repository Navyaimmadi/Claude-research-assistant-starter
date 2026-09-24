import { readFile, writeFile } from "node:fs/promises";

type Metric = {
  question: string;
  cache_hit: boolean;
  estimated_cost_usd: number | null;
  usage: { inputTokens: number; outputTokens: number; cacheWriteTokens: number; cacheReadTokens: number };
};

const text = await readFile("metrics/requests.jsonl", "utf8");
const metrics = text.trim().split("\n").filter(Boolean).map(line => JSON.parse(line) as Metric);
const hits = metrics.filter(metric => metric.cache_hit).length;
const hitRate = metrics.length ? hits / metrics.length : 0;
const sums = metrics.reduce((sum, metric) => ({
  input: sum.input + metric.usage.inputTokens,
  output: sum.output + metric.usage.outputTokens,
  cacheWrite: sum.cacheWrite + metric.usage.cacheWriteTokens,
  cacheRead: sum.cacheRead + metric.usage.cacheReadTokens,
  cost: sum.cost + (metric.estimated_cost_usd ?? 0),
  unknownCost: sum.unknownCost || metric.estimated_cost_usd === null
}), { input: 0, output: 0, cacheWrite: 0, cacheRead: 0, cost: 0, unknownCost: false });

const cacheReport = `# Cache Performance Metrics\n\n- Requests: ${metrics.length}\n- Cache hits: ${hits}\n- Cache misses: ${metrics.length - hits}\n- Hit rate: ${(hitRate * 100).toFixed(2)}%\n- Cache creation tokens: ${sums.cacheWrite}\n- Cache read tokens: ${sums.cacheRead}\n\nRequired target: greater than 70% on repeated queries.\n`;
const rows = metrics.map((metric, index) => `| ${index + 1} | ${metric.usage.inputTokens} | ${metric.usage.outputTokens} | ${metric.usage.cacheWriteTokens} | ${metric.usage.cacheReadTokens} | ${metric.estimated_cost_usd === null ? "Unknown (prices unset)" : `$${metric.estimated_cost_usd.toFixed(6)}`} |`).join("\n");
const costReport = `# Cost Analysis\n\n| Query | Input | Output | Cache write | Cache read | Estimated cost |\n|---:|---:|---:|---:|---:|---:|\n${rows}\n\n${sums.unknownCost ? "**Aggregate estimated cost: unknown (set all provider prices in `.env`).**" : `**Aggregate estimated cost: $${sums.cost.toFixed(6)}**`}\n\nRates are read from local environment variables and must match the shared provider's published rates.\n`;

await writeFile("reports/cache-performance.md", cacheReport);
await writeFile("reports/cost-analysis.md", costReport);
console.log("Reports updated from real request metrics.");
