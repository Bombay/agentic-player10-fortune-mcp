import { describe, expect, it, vi } from "vitest";
import {
  CerebrasAiReadingGenerator,
  createCerebrasReadingGeneratorFromEnv,
} from "./cerebras-ai.js";

describe("CerebrasAiReadingGenerator", () => {
  it("requests a short grounded answer with minimal hidden reasoning", async () => {
    const fetcher = vi.fn(async () =>
      new Response(
        JSON.stringify({
          choices: [
            {
              finish_reason: "stop",
              message: { content: "### 타고난 구조\n충분히 긴 상담 결과" },
            },
          ],
        }),
        { status: 200 },
      ),
    );
    const generator = new CerebrasAiReadingGenerator(
      { apiKey: "secret-token" },
      fetcher,
    );

    await generator.generate({
      question: "사주팔자만 깊게 봐줘",
      factContext: "일간 甲木\n현재 대운 庚申",
    });

    expect(fetcher).toHaveBeenCalledOnce();
    const [url, init] = fetcher.mock.calls[0];
    const body = JSON.parse(String(init?.body));

    expect(String(url)).toBe(
      "https://api.cerebras.ai/v1/chat/completions",
    );
    expect(init?.headers).toMatchObject({
      authorization: "Bearer secret-token",
    });
    expect(body.model).toBe("gpt-oss-120b");
    expect(body.max_completion_tokens).toBe(900);
    expect(body.reasoning_effort).toBe("low");
    expect(body.reasoning_format).toBe("hidden");
    expect(body.stream).toBe(false);
    expect(body.messages[1].content).toContain("사주팔자만 깊게 봐줘");
    expect(body.messages[1].content).toContain("현재 대운 庚申");
  });

  it("is disabled when the API key is missing", () => {
    expect(createCerebrasReadingGeneratorFromEnv({})).toBeUndefined();
  });

  it("rejects provider errors without exposing the response body", async () => {
    const generator = new CerebrasAiReadingGenerator(
      { apiKey: "secret-token" },
      async () => new Response("sensitive provider error", { status: 429 }),
    );

    await expect(
      generator.generate({ question: "전체 운세", factContext: "facts" }),
    ).rejects.toThrow("status 429");
  });

  it("rejects truncated completions", async () => {
    const generator = new CerebrasAiReadingGenerator(
      { apiKey: "secret-token" },
      async () =>
        new Response(
          JSON.stringify({
            choices: [
              {
                finish_reason: "length",
                message: { content: "### 미완성\n중간에서 잘린 답변" },
              },
            ],
          }),
          { status: 200 },
        ),
    );

    await expect(
      generator.generate({ question: "전체 운세", factContext: "facts" }),
    ).rejects.toThrow("completion budget");
  });
});
