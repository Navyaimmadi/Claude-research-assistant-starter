import "dotenv/config";
import { z } from "zod";

const optionalPrice = z.preprocess(
  value => value === "" || value === undefined ? undefined : value,
  z.coerce.number().nonnegative().optional()
);

const envSchema = z.object({
  SHARED_LLM_API_KEY: z.string().min(1),
  SHARED_LLM_BASE_URL: z.string().url(),
  // Set this after `npm run probe`; auto deliberately refuses normal agent runs.
  SHARED_LLM_PROTOCOL: z.enum(["auto", "anthropic", "openai"]).default("auto"),
  MODEL_NAME: z.string().min(1).default("kimi-k2.7-code"),
  INPUT_PRICE_PER_MILLION: optionalPrice,
  OUTPUT_PRICE_PER_MILLION: optionalPrice,
  CACHE_WRITE_PRICE_PER_MILLION: optionalPrice,
  CACHE_READ_PRICE_PER_MILLION: optionalPrice,
  THINKING_BUDGET_TOKENS: z.coerce.number().int().min(1024).default(2048),
  MAX_OUTPUT_TOKENS: z.coerce.number().int().positive().default(4096),
  MAX_AGENT_TURNS: z.coerce.number().int().min(1).max(20).default(8)
});

export const config = envSchema.parse(process.env);
