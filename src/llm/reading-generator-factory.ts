import type { FortuneReadingGenerator } from "./reading-generator.js";
import { createCerebrasReadingGeneratorFromEnv } from "./cerebras-ai.js";
import { createCloudflareReadingGeneratorFromEnv } from "./cloudflare-workers-ai.js";

export type FortuneReadingProvider = "cerebras" | "cloudflare";

export function resolveReadingProvider(
  env: NodeJS.ProcessEnv = process.env,
): FortuneReadingProvider | undefined {
  const configured = env.FORTUNE_READING_PROVIDER?.trim().toLowerCase();

  if (configured) {
    if (configured === "cerebras" || configured === "cloudflare") {
      return configured;
    }
    throw new Error(`Unsupported fortune reading provider: ${configured}`);
  }

  if (env.CEREBRAS_API_KEY?.trim()) return "cerebras";
  if (
    env.CLOUDFLARE_ACCOUNT_ID?.trim() &&
    env.CLOUDFLARE_API_TOKEN?.trim()
  ) {
    return "cloudflare";
  }
  return undefined;
}

export function createReadingGeneratorFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): FortuneReadingGenerator | undefined {
  const provider = resolveReadingProvider(env);

  if (provider === "cerebras") {
    return createCerebrasReadingGeneratorFromEnv(env);
  }
  if (provider === "cloudflare") {
    return createCloudflareReadingGeneratorFromEnv(env);
  }
  return undefined;
}
