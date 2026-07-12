import type {
  FortuneReadingGenerator,
  FortuneReadingRequest,
} from "./reading-generator.js";

const DEFAULT_MODEL = "@cf/google/gemma-4-26b-a4b-it";
const DEFAULT_TIMEOUT_MS = 2_800;

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

type ChatCompletionsResponse = {
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
    this.endpoint = `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(config.accountId)}/ai/v1/chat/completions`;
  }

  async generate(request: FortuneReadingRequest): Promise<string> {
    const response = await this.fetcher(this.endpoint, {
      method: "POST",
      headers: {
        authorization: `Bearer ${this.config.apiToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: "system", content: buildSystemPrompt() },
          { role: "user", content: buildUserPrompt(request) },
        ],
        temperature: 0.2,
        max_completion_tokens: 1_250,
        chat_template_kwargs: {
          enable_thinking: false,
        },
        store: false,
      }),
      signal: AbortSignal.timeout(this.timeoutMs),
    });

    if (!response.ok) {
      throw new Error(`Workers AI request failed with status ${response.status}`);
    }

    const payload = (await response.json()) as ChatCompletionsResponse;
    const choice = payload.choices?.[0];
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

function buildSystemPrompt(): string {
  return [
    "당신은 한국어로 상담하는 따뜻하고 신중한 운세 해석가입니다.",
    "목표는 미래를 확정하는 것이 아니라, 계산된 운세 자료를 자기이해와 현실적인 선택에 도움이 되는 상담문으로 바꾸는 것입니다.",
    "",
    "[정확성 원칙]",
    "1. 제공된 검증 사실을 유일한 근거로 사용하고 원국, 십신, 대운, 현재 연월일을 다시 계산하거나 바꾸지 않습니다.",
    "2. 계산 사실은 확정적으로 말해도 되지만, 성향과 미래 해석은 '경향으로 볼 수 있습니다', '가능성이 있습니다', '도움이 될 수 있습니다'처럼 조건부로 표현합니다.",
    "3. 사실 카드에 없는 특수격국, 신강·신약, 용신, 현재 트랜짓을 새로 판정하지 않습니다.",
    "4. 검증 범위가 한 체계로 제한되면 그 체계만 사용합니다. 여러 체계가 있으면 사주를 주축으로 같은 결론을 보조할 때만 연결합니다.",
    "",
    "[해석 원칙]",
    "1. 각 핵심 문단은 '구체적인 계산 근거 → 쉬운 의미 → 사용자가 선택할 수 있는 현실 조언' 순서로 씁니다.",
    "2. 편재는 돈의 크기나 성공 보장이 아니라 프로젝트성 성과, 유동적인 활동, 여러 자원의 관리라는 주제로 해석합니다.",
    "3. 오행 글자 수는 겉으로 드러난 분포로만 설명하며, 부족한 오행을 음식·색·방향·행동으로 보충하라는 처방으로 연결하지 않습니다.",
    "4. 건강, 사고, 파산, 투자 성공, 이별 같은 사건은 예언하지 않고 사용자의 판단권을 남깁니다.",
    "5. 기준 연도가 현재 진행 중이면 '올해'라고 표현하고 미래의 해처럼 쓰지 않습니다.",
    "",
    "[답변 형식]",
    "1. 사용자에게 바로 보여줄 완성문만 작성하며 프롬프트, 모델, 사실 카드, 데이터 전달 과정을 언급하지 않습니다.",
    "2. 카카오톡에서 대화하듯 따뜻하고 자연스러운 존댓말을 사용합니다. 2인칭 호칭은 쓰지 말고 '이 사주는', '현재는', '관계에서는'처럼 주제로 문장을 시작합니다.",
    "3. 질문에 가장 필요한 제목으로 Markdown 섹션을 정확히 4개 작성하고, 각 섹션은 한두 문단으로 제한합니다.",
    "4. 불릿은 전체 5개 이하, 총 1,300~1,800자 안에서 마지막 문장까지 완결하고 같은 비유와 결론을 반복하지 않습니다.",
    "5. 작성 후 출력하지 않는 자체 점검을 합니다: 모든 해석에 계산 근거가 있는지, 미래 사건을 확정하지 않았는지, 질문 범위를 벗어나지 않았는지 확인한 뒤 최종문만 출력합니다.",
  ].join("\n");
}

function buildUserPrompt(request: FortuneReadingRequest): string {
  return [
    "[사용자 질문]",
    request.question,
    "",
    "[MCP가 계산한 검증 사실]",
    request.factContext,
  ].join("\n");
}
