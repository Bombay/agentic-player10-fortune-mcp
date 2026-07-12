import { describe, expect, it, vi } from "vitest";
import {
  CloudflareWorkersAiReadingGenerator,
  DEFAULT_WORKERS_AI_MAX_TOKENS,
  DEFAULT_WORKERS_AI_TIMEOUT_MS,
  createCloudflareReadingGeneratorFromEnv,
} from "./cloudflare-workers-ai.js";

describe("CloudflareWorkersAiReadingGenerator", () => {
  it("waits long enough for a complete Gemma reading by default", () => {
    expect(DEFAULT_WORKERS_AI_TIMEOUT_MS).toBe(60_000);
    expect(DEFAULT_WORKERS_AI_MAX_TOKENS).toBe(600);
  });

  it("sends verified facts with thinking disabled", async () => {
    const fetcher = vi.fn(async () =>
      new Response(
        JSON.stringify({
          result: {
            choices: [
              {
                finish_reason: "stop",
                message: { content: "## 전체 요약\n충분히 긴 상담 결과" },
              },
            ],
          },
        }),
        { status: 200 },
      ),
    );
    const generator = new CloudflareWorkersAiReadingGenerator(
      {
        accountId: "account-id",
        apiToken: "secret-token",
      },
      fetcher,
    );

    await generator.generate({
      question: "올해 이직운을 깊게 봐줘",
      factContext: "현재 진행 중인 올해는 2026년 丙午\n일간 甲\n현재 대운 庚申",
    });

    expect(fetcher).toHaveBeenCalledOnce();
    const [url, init] = fetcher.mock.calls[0];
    const body = JSON.parse(String(init?.body));

    expect(String(url)).toContain(
      "accounts/account-id/ai/run/@cf/google/gemma-4-26b-a4b-it",
    );
    expect(init?.headers).toMatchObject({
      authorization: "Bearer secret-token",
    });
    expect(body.model).toBeUndefined();
    expect(body.max_tokens).toBe(600);
    expect(body.chat_template_kwargs).toEqual({ enable_thinking: false });
    expect(body.messages[1].content).toContain("올해 이직운을 깊게 봐줘");
    expect(body.messages[1].content).toContain("2026년 丙午");
    expect(body.messages[1].content).toContain("현재 대운 庚申");
  });

  it("is disabled unless both Cloudflare credentials exist", () => {
    expect(createCloudflareReadingGeneratorFromEnv({})).toBeUndefined();
    expect(
      createCloudflareReadingGeneratorFromEnv({
        CLOUDFLARE_ACCOUNT_ID: "account-id",
      }),
    ).toBeUndefined();
  });

  it("rejects non-success responses without exposing the response body", async () => {
    const generator = new CloudflareWorkersAiReadingGenerator(
      { accountId: "account-id", apiToken: "secret-token" },
      async () => new Response("sensitive provider error", { status: 429 }),
    );

    await expect(
      generator.generate({
        question: "전체 운세",
        factContext: "facts",
      }),
    ).rejects.toThrow("status 429");
  });

  it("rejects truncated completions", async () => {
    const generator = new CloudflareWorkersAiReadingGenerator(
      { accountId: "account-id", apiToken: "secret-token" },
      async () =>
        new Response(
          JSON.stringify({
            result: {
              choices: [
                {
                  finish_reason: "length",
                  message: { content: "## 미완성\n중간에서 잘린 답변" },
                },
              ],
            },
          }),
          { status: 200 },
        ),
    );

    await expect(
      generator.generate({ question: "전체 운세", factContext: "facts" }),
    ).rejects.toThrow("completion budget");
  });

});
