import type { BirthInfoInput } from "./birth-info.js";
import { calculateFortune } from "./fortune-calculation.js";
import { formatFortuneContext } from "./fortune-context.js";
import { formatFortuneFacts } from "./fortune-facts.js";
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

  try {
    const reading = await options.generator.generate({
      question,
      factContext,
    });

    if (!isUsableReading(reading)) {
      return formatFortuneContext(calculation);
    }

    return formatFinalReading(reading);
  } catch (error) {
    console.warn(
      "Fortune reading generation failed; returning deterministic context:",
      error instanceof Error ? error.message : "unknown error",
    );
    return formatFortuneContext(calculation);
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
    normalized.length >= 700 &&
    normalized.length <= 8_000 &&
    headings >= 3 &&
    !refusalPatterns.some((pattern) => normalized.includes(pattern))
  );
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
