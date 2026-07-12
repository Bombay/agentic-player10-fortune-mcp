import type {
  FortuneReadingGenerator,
  FortuneReadingRequest,
} from "./reading-generator.js";
import {
  buildSystemPrompt,
  buildUserPrompt,
} from "./fortune-reading-prompt.js";

const CEREBRAS_ENDPOINT = "https://api.cerebras.ai/v1/chat/completions";
export const DEFAULT_CEREBRAS_MODEL = "gpt-oss-120b";
export const DEFAULT_CEREBRAS_TIMEOUT_MS = 2_500;
export const DEFAULT_CEREBRAS_MAX_TOKENS = 900;

type FetchLike = (
  input: string | URL,
  init?: RequestInit,
) => Promise<Response>;

export type CerebrasAiConfig = {
  apiKey: string;
  model?: string;
  timeoutMs?: number;
  maxTokens?: number;
};

type ChatCompletionsResult = {
  choices?: Array<{
    finish_reason?: string;
    message?: {
      content?: string | null;
    };
  }>;
};

export class CerebrasAiReadingGenerator implements FortuneReadingGenerator {
  private readonly model: string;
  private readonly timeoutMs: number;
  private readonly maxTokens: number;

  constructor(
    private readonly config: CerebrasAiConfig,
    private readonly fetcher: FetchLike = fetch,
  ) {
    this.model = config.model ?? DEFAULT_CEREBRAS_MODEL;
    this.timeoutMs = config.timeoutMs ?? DEFAULT_CEREBRAS_TIMEOUT_MS;
    this.maxTokens = config.maxTokens ?? DEFAULT_CEREBRAS_MAX_TOKENS;
  }

  async generate(request: FortuneReadingRequest): Promise<string> {
    const response = await this.fetcher(CEREBRAS_ENDPOINT, {
      method: "POST",
      headers: {
        authorization: `Bearer ${this.config.apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: "system", content: buildSystemPrompt() },
          { role: "user", content: buildUserPrompt(request) },
        ],
        temperature: 0.1,
        max_completion_tokens: this.maxTokens,
        reasoning_effort: "low",
        reasoning_format: "hidden",
        stream: false,
      }),
      signal: AbortSignal.timeout(this.timeoutMs),
    });

    if (!response.ok) {
      throw new Error(`Cerebras request failed with status ${response.status}`);
    }

    const payload = (await response.json()) as ChatCompletionsResult;
    const choice = payload.choices?.[0];
    const reading = choice?.message?.content?.trim();

    if (!reading) {
      throw new Error("Cerebras returned an empty reading");
    }
    if (choice?.finish_reason === "length") {
      throw new Error("Cerebras reading exceeded its completion budget");
    }

    return reading;
  }
}

export function createCerebrasReadingGeneratorFromEnv(
  env: NodeJS.ProcessEnv = process.env,
  fetcher: FetchLike = fetch,
): FortuneReadingGenerator | undefined {
  const apiKey = env.CEREBRAS_API_KEY?.trim();
  if (!apiKey) return undefined;

  const configuredTimeout = Number.parseInt(
    env.CEREBRAS_AI_TIMEOUT_MS ?? "",
    10,
  );
  const configuredMaxTokens = Number.parseInt(
    env.CEREBRAS_AI_MAX_TOKENS ?? "",
    10,
  );

  return new CerebrasAiReadingGenerator(
    {
      apiKey,
      model: env.CEREBRAS_AI_MODEL?.trim() || undefined,
      timeoutMs:
        Number.isFinite(configuredTimeout) && configuredTimeout > 0
          ? configuredTimeout
          : undefined,
      maxTokens:
        Number.isFinite(configuredMaxTokens) && configuredMaxTokens > 0
          ? configuredMaxTokens
          : undefined,
    },
    fetcher,
  );
}
