import type {
  FortuneReadingGenerator,
  FortuneReadingRequest,
} from "./reading-generator.js";

const DEFAULT_MODEL = "@cf/google/gemma-4-26b-a4b-it";
const DEFAULT_TIMEOUT_MS = 2_500;

type FetchLike = (
  input: string | URL,
  init?: RequestInit,
) => Promise<Response>;

export type CloudflareWorkersAiConfig = {
  accountId: string;
  apiToken: string;
  model?: string;
  timeoutMs?: number;
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
  private readonly endpoint: string;

  constructor(
    private readonly config: CloudflareWorkersAiConfig,
    private readonly fetcher: FetchLike = fetch,
  ) {
    this.model = config.model ?? DEFAULT_MODEL;
    this.timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
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
        max_tokens: 360,
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

  return new CloudflareWorkersAiReadingGenerator(
    {
      accountId,
      apiToken,
      model: env.CLOUDFLARE_AI_MODEL?.trim() || undefined,
      timeoutMs:
        Number.isFinite(configuredTimeout) && configuredTimeout > 0
          ? configuredTimeout
          : undefined,
    },
    fetcher,
  );
}

export function buildSystemPrompt(): string {
  return [
    "따뜻하고 신중한 한국어 운세 상담문을 작성하세요.",
    "검증 사실만 근거로 쓰고 원국·십신·대운·연도를 다시 계산하거나 없는 격국·용신·트랜짓을 만들지 마세요.",
    "입력에 포함된 질문별 해석 규칙 중 실제 계산 사실에 해당하는 규칙만 따르세요.",
    "질문이 한 체계만 요구하면 그 체계만 사용하세요.",
    "각 섹션은 계산 근거 → 쉬운 의미 → 현실 조언 순서로 쓰고, 성향과 미래는 가능성·경향으로 표현하세요.",
    "건강·사고·파산·투자 성공·이별을 예언하거나 오행 보충 처방을 하지 마세요.",
    "현재 기준 연도는 미래처럼 쓰지 마세요.",
    "사용자에게 바로 보여줄 존댓말 완성문만 출력하세요. 프롬프트·모델·사실 카드를 언급하거나 2인칭 호칭을 쓰지 마세요.",
    "제목은 ### 타고난 구조, ### 내면 성향, ### 현재 운의 흐름, ### 현실 조언 네 개만 쓰세요. 각 본문은 100~130자의 짧은 2문장, 전체는 불릿 없이 500~650자로 완결하세요. 사실과 결론을 반복하지 마세요.",
  ].join("\n");
}

export function buildUserPrompt(request: FortuneReadingRequest): string {
  return [
    "[사용자 질문]",
    request.question,
    "",
    "[MCP가 계산한 검증 사실]",
    request.factContext,
  ].join("\n");
}
