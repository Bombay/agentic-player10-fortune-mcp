import { calculateNatal, PLANET_KO, ZODIAC_KO } from "@orrery/core/natal";
import { calculateSaju } from "@orrery/core/saju";
import type {
  BirthInput,
  NatalAspect,
  NatalChart,
  PlanetPosition,
  SajuResult,
  ZiweiChart,
} from "@orrery/core/types";
import { createChart, getDaxianList } from "@orrery/core/ziwei";
import {
  type BirthInfoInput,
  type NormalizedBirthInfo,
  normalizeBirthInfo,
} from "./birth-info.js";

const PILLAR_NAMES = ["시주", "일주", "월주", "년주"] as const;
const ASPECT_KO: Record<NatalAspect["type"], string> = {
  conjunction: "합",
  sextile: "육합",
  square: "스퀘어",
  trine: "트라인",
  opposition: "충",
};

export async function generateFortuneContext(
  input: BirthInfoInput,
): Promise<string> {
  const normalized = normalizeBirthInfo(input);
  const birthInput = toOrreryBirthInput(normalized);
  const saju = calculateSaju(birthInput);
  const ziwei = createChart(
    normalized.year,
    normalized.month,
    normalized.day,
    normalized.hour,
    normalized.minute,
    normalized.gender === "M",
  );
  const natal = await calculateNatal(birthInput);

  return [
    formatAiGuidance(),
    formatInputSummary(normalized),
    formatSaju(saju),
    formatZiwei(ziwei),
    formatNatal(natal),
    formatPrivacyNote(),
  ].join("\n\n");
}

function toOrreryBirthInput(input: NormalizedBirthInfo): BirthInput {
  return {
    year: input.year,
    month: input.month,
    day: input.day,
    hour: input.hour,
    minute: input.minute,
    gender: input.gender,
    latitude: input.latitude,
    longitude: input.longitude,
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

function formatSaju(saju: SajuResult): string {
  const pillars = saju.pillars.map((detail, index) => {
    const name = PILLAR_NAMES[index] ?? `주${index + 1}`;
    return [
      `- ${name}: ${detail.pillar.ganzi}`,
      `  - 천간/지지: ${detail.pillar.stem}${detail.pillar.branch}`,
      `  - 십신: 천간 ${detail.stemSipsin}, 지지 ${detail.branchSipsin}`,
      `  - 12운성/신살: ${detail.unseong}, ${detail.sinsal}`,
      `  - 지장간: ${detail.jigang}`,
    ].join("\n");
  });

  const daewoon = saju.daewoon.slice(0, 10).map((item) => {
    return `- ${item.index}운 ${item.ganzi}: ${item.age}세 시작 (${item.startDate.getFullYear()}년), 십신 ${item.stemSipsin}/${item.branchSipsin}, 운성 ${item.unseong}${item.isGongmang ? ", 공망" : ""}`;
  });

  return [
    "# 사주팔자",
    "",
    "## 사주 원국",
    ...pillars,
    "",
    "## 공망",
    `- 공망 지지: ${saju.gongmang.branches.join(", ")}`,
    `- 공망 위치: ${saju.gongmang.pillarIndices.length > 0 ? saju.gongmang.pillarIndices.map((index) => PILLAR_NAMES[index] ?? `주${index + 1}`).join(", ") : "해당 없음"}`,
    "",
    "## 대운",
    ...daewoon,
  ].join("\n");
}

function formatZiwei(chart: ZiweiChart): string {
  const shenGong = Object.values(chart.palaces).find((palace) => palace.isShenGong);
  const palaces = Object.values(chart.palaces).map((palace) => {
    const stars =
      palace.stars.length > 0
        ? palace.stars
            .map((star) =>
              [star.name, star.brightness, star.siHua]
                .filter((part) => part.length > 0)
                .join("/"),
            )
            .join(", ")
        : "(공궁)";

    return `- ${palace.name} ${palace.ganZhi}${palace.isShenGong ? " · 신궁" : ""}: ${stars}`;
  });

  const daxian = getDaxianList(chart).map((item) => {
    const stars = item.mainStars.length > 0 ? item.mainStars.join(", ") : "(공궁)";
    return `- ${item.ageStart}-${item.ageEnd}세 ${item.palaceName} ${item.ganZhi}: ${stars}`;
  });

  return [
    "# 자미두수",
    "",
    `- 음력: ${chart.lunarYear}년 ${chart.lunarMonth}월 ${chart.lunarDay}일${chart.isLeapMonth ? " 윤달" : ""}`,
    `- 년주: ${chart.yearGan}${chart.yearZhi}`,
    `- 명궁: ${chart.mingGongZhi}`,
    `- 신궁: ${shenGong?.name ?? "확인 불가"} (${chart.shenGongZhi})`,
    `- 오행국: ${chart.wuXingJu.name}`,
    `- 대限 시작: ${chart.daXianStartAge}세`,
    "",
    "## 12궁",
    ...palaces,
    "",
    "## 대한",
    ...daxian,
  ].join("\n");
}

function formatNatal(chart: NatalChart): string {
  const angles = chart.angles
    ? [
        "## 앵글",
        `- ASC: ${formatZodiacPoint(chart.angles.asc.sign, chart.angles.asc.degreeInSign)}`,
        `- MC: ${formatZodiacPoint(chart.angles.mc.sign, chart.angles.mc.degreeInSign)}`,
        `- DESC: ${formatZodiacPoint(chart.angles.desc.sign, chart.angles.desc.degreeInSign)}`,
        `- IC: ${formatZodiacPoint(chart.angles.ic.sign, chart.angles.ic.degreeInSign)}`,
        "",
      ]
    : ["## 앵글", "- 출생 시간이 없어 계산하지 않음", ""];

  const planets = chart.planets.map(formatPlanet);
  const aspects = chart.aspects.slice(0, 20).map(formatAspect);

  return [
    "# 서양 점성술 출생차트",
    "",
    ...angles,
    "## 행성",
    ...planets,
    "",
    "## 주요 애스펙트",
    ...(aspects.length > 0 ? aspects : ["- 주요 애스펙트 없음"]),
  ].join("\n");
}

function formatPlanet(planet: PlanetPosition): string {
  const planetName = PLANET_KO[planet.id] ?? planet.id;
  const sign = formatZodiacPoint(planet.sign, planet.degreeInSign);
  const house = planet.house == null ? "" : `, ${planet.house}하우스`;
  const retrograde = planet.isRetrograde ? ", 역행" : "";

  return `- ${planetName}: ${sign}${house}${retrograde}`;
}

function formatAspect(aspect: NatalAspect): string {
  const planet1 = PLANET_KO[aspect.planet1] ?? aspect.planet1;
  const planet2 = PLANET_KO[aspect.planet2] ?? aspect.planet2;

  return `- ${planet1} ${ASPECT_KO[aspect.type]} ${planet2}: 오브 ${aspect.orb.toFixed(1)}도`;
}

function formatZodiacPoint(sign: PlanetPosition["sign"], degree: number): string {
  const signName = ZODIAC_KO[sign] ?? sign;

  return `${signName} ${degree.toFixed(1)}도`;
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
