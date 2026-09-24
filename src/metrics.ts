import { appendFile, mkdir } from "node:fs/promises";

export type UsageTotals = {
  inputTokens: number;
  outputTokens: number;
  cacheWriteTokens: number;
  cacheReadTokens: number;
};

export const emptyUsage = (): UsageTotals => ({ inputTokens: 0, outputTokens: 0, cacheWriteTokens: 0, cacheReadTokens: 0 });

export function addUsage(total: UsageTotals, usage: Record<string, unknown>) {
  total.inputTokens += Number(usage.input_tokens ?? 0);
  total.outputTokens += Number(usage.output_tokens ?? 0);
  total.cacheWriteTokens += Number(usage.cache_creation_input_tokens ?? 0);
  total.cacheReadTokens += Number(usage.cache_read_input_tokens ?? 0);
}

export function estimateCost(usage: UsageTotals, prices: { INPUT_PRICE_PER_MILLION?: number; OUTPUT_PRICE_PER_MILLION?: number; CACHE_WRITE_PRICE_PER_MILLION?: number; CACHE_READ_PRICE_PER_MILLION?: number }) {
  if (prices.INPUT_PRICE_PER_MILLION === undefined || prices.OUTPUT_PRICE_PER_MILLION === undefined || prices.CACHE_WRITE_PRICE_PER_MILLION === undefined || prices.CACHE_READ_PRICE_PER_MILLION === undefined) return null;
  return (
    usage.inputTokens * prices.INPUT_PRICE_PER_MILLION +
    usage.outputTokens * prices.OUTPUT_PRICE_PER_MILLION +
    usage.cacheWriteTokens * prices.CACHE_WRITE_PRICE_PER_MILLION +
    usage.cacheReadTokens * prices.CACHE_READ_PRICE_PER_MILLION
  ) / 1_000_000;
}

export async function saveMetric(metric: Record<string, unknown>) {
  await mkdir("metrics", { recursive: true });
  await appendFile("metrics/requests.jsonl", `${JSON.stringify(metric)}\n`, "utf8");
}
