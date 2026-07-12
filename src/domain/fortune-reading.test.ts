import { describe, expect, it, vi } from "vitest";
import type { FortuneReadingGenerator } from "../llm/reading-generator.js";
import { generateFortuneReading, isUsableReading } from "./fortune-reading.js";

const birthInput = {
  year: 1988,
  month: 4,
  day: 19,
  hour: 8,
  minute: 30,
  gender: "M" as const,
  birthplace: "서울",
};

function detailedReading(): string {
  return [
    "## 전체 요약",
    "큰일을 현실적인 성과로 만드는 힘이 강하지만 책임까지 혼자 떠안기 쉬운 구조입니다.",
    "## 타고난 성향",
    "甲木과 반복되는 辰은 방향성을 세우고 복잡한 문제를 오래 검토하는 힘으로 나타납니다.",
    "## 일과 돈",
    "破軍과 七殺의 흐름은 정답이 없는 문제를 재구성할 때 강점이 살아난다는 뜻입니다.",
    "## 현재 흐름",
    "현재 庚申 대운에는 책임과 권한이 함께 커지므로 역할과 기준을 명확히 정하는 것이 중요합니다.",
    "## 실천 조언",
    "기회를 모두 잡기보다 한두 가지를 선별하고, 돈과 일정의 규칙을 문서로 만들어 부담을 나누세요.",
    "이 설명은 계산 근거를 일상적인 선택에 연결한 것입니다. 중요한 결정을 운세 하나로 단정하지 말고 현실 조건과 함께 살펴보세요.",
    "반복되는 생각은 분석력으로 쓸 수 있지만 결정을 늦추기도 합니다. 마감 시각과 판단 기준을 미리 정하면 장점이 더 잘 살아납니다.",
    "사람과 시스템에 역할을 나누는 것이 지금 시기의 성장 과제이며, 혼자 증명하려는 압박을 줄일수록 결과가 안정됩니다.",
    "새로운 일을 시작할 때는 예상 수익보다 고정비와 회수 기간을 먼저 확인하는 방식이 특히 잘 맞습니다.",
    "관계에서도 상대를 설득하거나 해결책을 먼저 제시하기보다, 각자가 맡을 책임과 기대를 말로 확인하면 불필요한 긴장을 줄일 수 있습니다. 지금은 능력을 더 증명하는 것보다 이미 가진 역량이 오래 작동하도록 생활과 업무의 구조를 정비하는 편이 중요합니다.",
  ].join("\n\n");
}

describe("generateFortuneReading", () => {
  it("returns a complete final answer and sends verified facts instead of the raw chart", async () => {
    const generate = vi.fn(async () => detailedReading());
    const generator: FortuneReadingGenerator = { generate };

    const text = await generateFortuneReading(
      { ...birthInput, question: "올해 일과 돈을 자세히 봐줘" },
      { generator, currentDate: new Date("2026-07-12T00:00:00.000Z") },
    );

    expect(text).toContain("# 응답 전달 지침");
    expect(text).toContain("# 상담 결과");
    expect(text).toContain("## 일과 돈");
    expect(text).not.toContain("# 입력 요약");
    expect(generate).toHaveBeenCalledOnce();

    const request = generate.mock.calls[0][0];
    expect(request.question).toBe("올해 일과 돈을 자세히 봐줘");
    expect(request.factContext).toContain("# 검증된 사주 사실");
    expect(request.factContext).toContain("현재 대운: 2023년 시작 庚申");
    expect(request.factContext).not.toContain("생년월일시");
    expect(request.factContext).not.toContain("출생지: 서울");
    expect(request.factContext).not.toContain("Houses (Placidus)");
  });

  it("falls back to deterministic context when the model output is too weak", async () => {
    const generator: FortuneReadingGenerator = {
      generate: async () => "짧고 단편적인 답변입니다.",
    };

    const text = await generateFortuneReading(birthInput, { generator });

    expect(text).toContain("# AI 상담 지침");
    expect(text).toContain("四柱八字 (男)");
  });
});

describe("isUsableReading", () => {
  it("accepts a sufficiently detailed structured reading", () => {
    expect(isUsableReading(detailedReading())).toBe(true);
  });

  it("rejects refusals", () => {
    const refusal = `${detailedReading()}\n\n해석할 수 없습니다.`;
    expect(isUsableReading(refusal)).toBe(false);
  });

  it("accepts level-three Markdown headings returned by Gemma", () => {
    expect(isUsableReading(detailedReading().replaceAll("## ", "### "))).toBe(
      true,
    );
  });

});
