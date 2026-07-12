import { describe, expect, it } from "vitest";
import { CerebrasAiReadingGenerator } from "./cerebras-ai.js";
import { CloudflareWorkersAiReadingGenerator } from "./cloudflare-workers-ai.js";
import {
  createReadingGeneratorFromEnv,
  resolveReadingProvider,
} from "./reading-generator-factory.js";

describe("reading generator factory", () => {
  it("uses the explicitly configured Cerebras provider", () => {
    const env = {
      FORTUNE_READING_PROVIDER: "cerebras",
      CEREBRAS_API_KEY: "csk-test-key",
      CLOUDFLARE_ACCOUNT_ID: "cloudflare-account",
      CLOUDFLARE_API_TOKEN: "cloudflare-token",
    };

    expect(resolveReadingProvider(env)).toBe("cerebras");
    expect(createReadingGeneratorFromEnv(env)).toBeInstanceOf(
      CerebrasAiReadingGenerator,
    );
  });

  it("prefers Cerebras when both providers exist without an override", () => {
    const env = {
      CEREBRAS_API_KEY: "csk-test-key",
      CLOUDFLARE_ACCOUNT_ID: "cloudflare-account",
      CLOUDFLARE_API_TOKEN: "cloudflare-token",
    };

    expect(resolveReadingProvider(env)).toBe("cerebras");
  });

  it("retains Cloudflare as a backwards-compatible option", () => {
    const env = {
      FORTUNE_READING_PROVIDER: "cloudflare",
      CLOUDFLARE_ACCOUNT_ID: "cloudflare-account",
      CLOUDFLARE_API_TOKEN: "cloudflare-token",
    };

    expect(createReadingGeneratorFromEnv(env)).toBeInstanceOf(
      CloudflareWorkersAiReadingGenerator,
    );
  });

  it("rejects unknown provider names", () => {
    expect(() =>
      resolveReadingProvider({ FORTUNE_READING_PROVIDER: "unknown" }),
    ).toThrow("Unsupported fortune reading provider");
  });
});
