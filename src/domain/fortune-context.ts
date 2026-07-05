import { calculateNatal } from "@orrery/core/natal";
import { calculateSaju } from "@orrery/core/saju";
import type { BirthInput, ZiweiChart } from "@orrery/core/types";
import { createChart } from "@orrery/core/ziwei";
import {
  type BirthInfoInput,
  type NormalizedBirthInfo,
  normalizeBirthInfo,
} from "./birth-info.js";
import { natalToText, sajuToText, ziweiToText } from "./orrery-text-export.js";

type SiteBirthInput = BirthInput & {
  timezone?: string;
};

const createSiteZiweiChart = createChart as (
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  isMale: boolean,
  timezone?: string,
  longitude?: number,
) => ZiweiChart;

export async function generateFortuneContext(
  input: BirthInfoInput,
): Promise<string> {
  const normalized = normalizeBirthInfo(input);
  const birthInput = toOrreryBirthInput(normalized);
  const saju = calculateSaju(birthInput);
  const ziwei = createSiteZiweiChart(
    normalized.year,
    normalized.month,
    normalized.day,
    normalized.hour,
    normalized.minute,
    normalized.gender === "M",
    normalized.timezone,
    normalized.longitude,
  );
  const natal = await calculateNatal(birthInput, "P");

  return [
    formatAiGuidance(),
    formatInputSummary(normalized),
    "# sky.told.me AI 해석용 전부 복사 결과",
    sajuToText(saju),
    ziweiToText(ziwei),
    natalToText(natal),
    formatPrivacyNote(),
  ].join("\n\n");
}

function toOrreryBirthInput(input: NormalizedBirthInfo): SiteBirthInput {
  return {
    year: input.year,
    month: input.month,
    day: input.day,
    hour: input.hour,
    minute: input.minute,
    gender: input.gender,
    latitude: input.latitude,
    longitude: input.longitude,
    timezone: input.timezone,
  };
}

function formatAiGuidance(): string {
  return [
    "# AI 상담 지침",
    "",
    "당신은 따뜻한 마음을 가진 사주·점성술 상담가입니다.",
    "아래의 사주팔자, 자미두수, 서양 점성술 컨텍스트를 사용해 사용자의 실제 고민에 맞춰 답변하세요.",
    "단정적인 예언, 공포 조장, 의학·법률·투자 판단은 피하고, 사용자가 스스로 선택할 수 있도록 조심스럽고 현실적인 조언을 함께 주세요.",
    "이 해석은 자기성찰과 엔터테인먼트 목적의 참고 자료로 다루세요.",
  ].join("\n");
}

function formatInputSummary(input: NormalizedBirthInfo): string {
  return [
    "# 입력 요약",
    "",
    `- 생년월일시: ${input.year}-${pad2(input.month)}-${pad2(input.day)} ${pad2(input.hour)}:${pad2(input.minute)}`,
    `- 성별: ${input.gender === "M" ? "남성" : "여성"}`,
    `- 출생지: ${input.birthplace}`,
    `- 좌표: 위도 ${input.latitude}, 경도 ${input.longitude}`,
    `- 시간대 참고: ${input.timezone}`,
  ].join("\n");
}

function formatPrivacyNote(): string {
  return [
    "# 처리 방식",
    "",
    "- 이 MCP는 입력된 생년월일시/출생지 정보를 저장하지 않습니다.",
    "- 응답은 현재 도구 호출에서 계산한 텍스트 컨텍스트입니다.",
  ].join("\n");
}

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}
