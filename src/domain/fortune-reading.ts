import type { BirthInfoInput } from "./birth-info.js";
import { calculateFortune } from "./fortune-calculation.js";
import { formatFortuneContext } from "./fortune-context.js";
import { formatFortuneFacts } from "./fortune-facts.js";
import {
  compactFortuneFacts,
  formatInterpretationGuidance,
} from "./fortune-guidance.js";
import type { FortuneReadingGenerator } from "../llm/reading-generator.js";

export type FortuneReadingInput = BirthInfoInput & {
  question?: string;
};

export type GenerateFortuneReadingOptions = {
  generator?: FortuneReadingGenerator;
  currentDate?: Date;
};

const DEFAULT_QUESTION = "내 사주와 현재 흐름을 전체적으로 자세히 봐줘.";

export async function generateFortuneReading(
  input: FortuneReadingInput,
  options: GenerateFortuneReadingOptions = {},
): Promise<string> {
  const calculation = await calculateFortune(input);

  if (!options.generator) {
    return formatFortuneContext(calculation);
  }

  const question = input.question?.trim() || DEFAULT_QUESTION;
  const currentDate = options.currentDate ?? new Date();
  const factContext = formatFortuneFacts(calculation, question, currentDate);
  const guidedFactContext = [
    formatInterpretationGuidance(factContext),
    factContext,
  ].join("\n\n");

  try {
    const reading = await options.generator.generate({
      question,
      factContext: guidedFactContext,
    });

    if (!isGroundedReading(reading, factContext, question)) {
      return formatGuidedFactFallback(question, factContext);
    }

    return formatFinalReading(reading);
  } catch (error) {
    console.warn(
      "Fortune reading generation failed; returning guided fact fallback:",
      error instanceof Error ? error.message : "unknown error",
    );
    return formatGuidedFactFallback(question, factContext);
  }
}

export function isUsableReading(reading: string): boolean {
  const normalized = reading.trim();
  const refusalPatterns = [
    "해석할 수 없습니다",
    "답변할 수 없습니다",
    "제공할 수 없습니다",
    "전문가와 상담",
  ];
  const headings = normalized.match(/^#{2,3}\s+.+$/gm)?.length ?? 0;

  return (
    normalized.length >= 450 &&
    normalized.length <= 8_000 &&
    headings >= 3 &&
    !refusalPatterns.some((pattern) => normalized.includes(pattern))
  );
}

export function isGroundedReading(
  reading: string,
  factContext: string,
  question: string,
): boolean {
  if (!isUsableReading(reading)) return false;

  const normalized = reading.trim();
  const dayMaster = factContext.match(
    /^- 일간: ([甲乙丙丁戊己庚辛壬癸])([木火土金水])/m,
  );
  if (dayMaster) {
    const koreanStem: Record<string, string> = {
      "甲": "갑",
      "乙": "을",
      "丙": "병",
      "丁": "정",
      "戊": "무",
      "己": "기",
      "庚": "경",
      "辛": "신",
      "壬": "임",
      "癸": "계",
    };
    if (
      !normalized.includes(`${dayMaster[1]}${dayMaster[2]}`) &&
      !normalized.includes(`${koreanStem[dayMaster[1]]}${elementToKorean(dayMaster[2])}`)
    ) {
      return false;
    }
  }

  if (
    factContext.includes("사주팔자만 해석") &&
    /(자미두수|서양 점성술|출생차트)/.test(normalized)
  ) {
    return false;
  }
  if (
    factContext.includes("자미두수만 해석") &&
    /(사주팔자|서양 점성술|출생차트)/.test(normalized)
  ) {
    return false;
  }
  if (
    factContext.includes("서양 점성술 출생차트만 해석") &&
    /(사주팔자|자미두수)/.test(normalized)
  ) {
    return false;
  }

  const unsupportedClaims = [
    "성공이 보장",
    "재정적 안정과 풍요",
    "반드시 일어",
    "오행을 보충",
  ];
  if (unsupportedClaims.some((claim) => normalized.includes(claim))) {
    return false;
  }

  if (/올해|금년|세운|올해 운세/.test(question)) {
    const yearFact = factContext.match(
      /^- 올해 세운: (\d{4})년 ([甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥])/m,
    );
    if (yearFact && !normalized.includes(yearFact[1])) return false;
  }

  return true;
}

function formatFinalReading(reading: string): string {
  return [
    "# 응답 전달 지침",
    "아래 `상담 결과`를 사용자의 최종 답변으로 생략하거나 요약하지 말고 그대로 전달하세요. 새로운 해석이나 서론을 추가하지 마세요.",
    "",
    "# 상담 결과",
    reading.trim(),
    "",
    "_이 해석은 자기성찰과 엔터테인먼트를 위한 참고 자료이며, 중요한 결정은 현실적인 정보와 함께 판단해 주세요._",
  ].join("\n");
}

export function formatGuidedFactFallback(
  question: string,
  factContext: string,
): string {
  return [
    "# AI 답변 지침",
    `질문: ${question}`,
    "아래 사실만 사용해 근거 → 쉬운 의미 → 현실 조언 순서의 Markdown 제목 4개, 700~1,000자 존댓말 상담문을 작성하세요. 미래는 경향으로 표현하세요.",
    "",
    formatInterpretationGuidance(factContext),
    "- 건강·파산·투자 성공·이별을 예언하지 말고 사용자의 판단권을 남기세요.",
    "",
    compactFortuneFacts(factContext),
  ].join("\n");
}

function elementToKorean(element: string): string {
  return { "木": "목", "火": "화", "土": "토", "金": "금", "水": "수" }[
    element
  ] ?? element;
}
