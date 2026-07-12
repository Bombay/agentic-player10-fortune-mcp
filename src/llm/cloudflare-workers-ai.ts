import type {
  FortuneReadingGenerator,
  FortuneReadingRequest,
} from "./reading-generator.js";
import {
  buildSystemPrompt,
  buildUserPrompt,
} from "./fortune-reading-prompt.js";

const DEFAULT_MODEL = "@cf/google/gemma-4-26b-a4b-it";
export const DEFAULT_WORKERS_AI_TIMEOUT_MS = 60_000;
export const DEFAULT_WORKERS_AI_MAX_TOKENS = 600;

type FetchLike = (
  input: string | URL,
  init?: RequestInit,
) => Promise<Response>;

export type CloudflareWorkersAiConfig = {
  accountId: string;
  apiToken: string;
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

export class CloudflareWorkersAiReadingGenerator
  implements FortuneReadingGenerator
{
  private readonly model: string;
  private readonly timeoutMs: number;
  private readonly maxTokens: number;
  private readonly endpoint: string;

  constructor(
    private readonly config: CloudflareWorkersAiConfig,
    private readonly fetcher: FetchLike = fetch,
  ) {
    this.model = config.model ?? DEFAULT_MODEL;
    this.timeoutMs = config.timeoutMs ?? DEFAULT_WORKERS_AI_TIMEOUT_MS;
    this.maxTokens = config.maxTokens ?? DEFAULT_WORKERS_AI_MAX_TOKENS;
    if (!/^@cf\/[A-Za-z0-9._-]+\/[A-Za-z0-9._-]+$/.test(this.model)) {
      throw new Error("Workers AI model must be a Cloudflare-hosted @cf model");
    }
    this.endpoint = `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(config.accountId)}/ai/run/${this.model}`;
  }

  async generate(request: FortuneReadingRequest): Promise<string> {
    const response = await this.fetcher(this.endpoint, {
      method: "POST",
      headers: {
        authorization: `Bearer ${this.config.apiToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: buildSystemPrompt() },
          { role: "user", content: buildUserPrompt(request) },
        ],
        temperature: 0.2,
        max_tokens: this.maxTokens,
        chat_template_kwargs: {
          enable_thinking: false,
        },
      }),
      signal: AbortSignal.timeout(this.timeoutMs),
    });

    if (!response.ok) {
      throw new Error(`Workers AI request failed with status ${response.status}`);
    }

    const payload = (await response.json()) as {
      result?: ChatCompletionsResult;
    };
    const choice = payload.result?.choices?.[0];
    const reading = choice?.message?.content?.trim();

    if (!reading) {
      throw new Error("Workers AI returned an empty reading");
    }
    if (choice?.finish_reason === "length") {
      throw new Error("Workers AI reading exceeded its completion budget");
    }

    return reading;
  }
}

export function createCloudflareReadingGeneratorFromEnv(
  env: NodeJS.ProcessEnv = process.env,
  fetcher: FetchLike = fetch,
): FortuneReadingGenerator | undefined {
  const accountId = env.CLOUDFLARE_ACCOUNT_ID?.trim();
  const apiToken = env.CLOUDFLARE_API_TOKEN?.trim();

  if (!accountId || !apiToken) {
    return undefined;
  }

  const configuredTimeout = Number.parseInt(
    env.CLOUDFLARE_AI_TIMEOUT_MS ?? "",
    10,
  );
  const configuredMaxTokens = Number.parseInt(
    env.CLOUDFLARE_AI_MAX_TOKENS ?? "",
    10,
  );

  return new CloudflareWorkersAiReadingGenerator(
    {
      accountId,
      apiToken,
      model: env.CLOUDFLARE_AI_MODEL?.trim() || undefined,
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
