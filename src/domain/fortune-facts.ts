import {
  BRANCH_ELEMENT,
  ELEMENT_HANJA,
  MAIN_STAR_NAMES,
  STEM_INFO,
} from "@orrery/core/constants";
import {
  analyzePillarRelations,
  getFourPillars,
  getHiddenStems,
  getJeonggi,
  getRelation,
  getYearGanzi,
} from "@orrery/core/pillars";
import type {
  PairRelation,
  PlanetPosition,
  ZiweiPalace,
} from "@orrery/core/types";
import { calculateLiunian, getDaxianList } from "@orrery/core/ziwei";
import type { FortuneCalculation } from "./fortune-calculation.js";

export type ReadingFocus = "saju" | "ziwei" | "western" | "combined";

type LocalDateParts = {
  year: number;
  month: number;
  day: number;
  isoDate: string;
};

const ELEMENT_NAMES: Record<string, string> = {
  tree: "목",
  fire: "화",
  earth: "토",
  metal: "금",
  water: "수",
};

const ZODIAC_KO: Record<string, string> = {
  Aries: "양자리",
  Taurus: "황소자리",
  Gemini: "쌍둥이자리",
  Cancer: "게자리",
  Leo: "사자자리",
  Virgo: "처녀자리",
  Libra: "천칭자리",
  Scorpio: "전갈자리",
  Sagittarius: "궁수자리",
  Capricorn: "염소자리",
  Aquarius: "물병자리",
  Pisces: "물고기자리",
};

const PLANET_KO: Record<string, string> = {
  Sun: "태양",
  Moon: "달",
  Mercury: "수성",
  Venus: "금성",
  Mars: "화성",
};

export function detectReadingFocus(question: string): ReadingFocus {
  const compact = question.replace(/\s+/g, "");

  if (/사주(?:팔자)?(?:만|로만|만으로)/.test(compact)) return "saju";
  if (/자미두수(?:만|로만|만으로)/.test(compact)) return "ziwei";
  if (/(?:서양)?점성술(?:만|로만|만으로)|출생차트(?:만|로만|만으로)/.test(compact)) {
    return "western";
  }

  return "combined";
}

export function formatFortuneFacts(
  calculation: FortuneCalculation,
  question: string,
  currentDate: Date,
): string {
  const focus = detectReadingFocus(question);
  const date = localDateParts(currentDate, calculation.birth.timezone);
  const sections = [formatSharedFacts(focus, date)];

  if (focus === "saju" || focus === "combined") {
    sections.push(formatSajuFacts(calculation, question, date));
  }
  if (focus === "ziwei" || focus === "combined") {
    sections.push(formatZiweiFacts(calculation, date));
  }
  if (focus === "western" || focus === "combined") {
    sections.push(formatWesternFacts(calculation));
  }

  return sections.join("\n\n");
}

function formatSharedFacts(focus: ReadingFocus, date: LocalDateParts): string {
  const focusLabel: Record<ReadingFocus, string> = {
    saju: "사주팔자만 해석. 자미두수와 서양 점성술은 언급 금지",
    ziwei: "자미두수만 해석. 사주팔자와 서양 점성술은 언급 금지",
    western: "서양 점성술 출생차트만 해석. 사주팔자와 자미두수는 언급 금지",
    combined: "사주팔자를 주축으로 두 체계는 같은 결론의 보조 근거로만 사용",
  };

  return [
    "# 검증 범위",
    `- 상담 기준일: ${date.isoDate}`,
    `- ${date.year}년은 현재 진행 중인 올해이며 년주는 ${getYearGanzi(date.year)}`,
    `- 질문 범위: ${focusLabel[focus]}`,
    "- 아래 사실은 계산 결과이므로 다시 계산하거나 바꾸지 말 것",
    "- 아래에 없는 현재 트랜짓이나 사건은 추측하지 말 것",
  ].join("\n");
}

function formatSajuFacts(
  calculation: FortuneCalculation,
  question: string,
  date: LocalDateParts,
): string {
  const { saju } = calculation;
  const pillarLabels = ["시주", "일주", "월주", "년주"];
  const dayStem = saju.pillars[1].pillar.stem;
  const elementCounts = countVisibleElements(saju.pillars);
  const currentDaewoon = findCurrentDaewoon(saju.daewoon, date.year);
  const yearGanzi = getYearGanzi(date.year);
  const yearStemRelation = getRelation(dayStem, yearGanzi[0])?.hanja ?? "알 수 없음";
  const yearBranchRelation =
    getRelation(dayStem, getJeonggi(yearGanzi[1]))?.hanja ?? "알 수 없음";
  const lines = [
    "# 검증된 사주 사실",
    `- 원국: ${saju.pillars.map((item, index) => `${pillarLabels[index]} ${item.pillar.ganzi}`).join(", ")}`,
    `- 일간: ${dayStem}${ELEMENT_HANJA[STEM_INFO[dayStem].element] ?? ""}`,
    `- 겉으로 드러난 오행 글자 수: ${formatElementCounts(elementCounts)}`,
    "- 오행 글자 수는 겉으로 드러난 분포 사실일 뿐이며 신강·신약, 용신, 부족한 오행의 생활 보완을 판정하는 근거로 사용하지 않음",
    `- 천간 십신: ${saju.pillars.map((item, index) => `${pillarLabels[index]} ${item.stemSipsin}`).join(", ")}`,
    `- 지지 대표 십신: ${saju.pillars.map((item, index) => `${pillarLabels[index]} ${item.branchSipsin}`).join(", ")}`,
    `- 지장간: ${saju.pillars.map((item, index) => `${pillarLabels[index]} ${item.pillar.branch}(${getHiddenStems(item.pillar.branch)})`).join(", ")}`,
    ...formatRelationFacts(saju.relations.pairs),
  ];

  if (currentDaewoon) {
    lines.push(
      `- 현재 대운: ${currentDaewoon.startDate.getFullYear()}년 시작 ${currentDaewoon.ganzi}, 천간 ${currentDaewoon.stemSipsin}, 지지 ${currentDaewoon.branchSipsin}`,
    );
  }

  lines.push(
    `- 올해 세운: ${date.year}년 ${yearGanzi}, 일간 기준 천간 ${yearStemRelation}, 지지 정기 기준 ${yearBranchRelation}`,
    "- 신살은 보조지표이며 사고·질병·불행의 예언에 사용하지 않음",
  );

  if (/오늘|금일|일진|하루/.test(question)) {
    lines.push(...formatDailyFacts(saju.pillars[1].pillar.ganzi, dayStem, date));
  } else if (/이번\s*달|이달|월운/.test(question)) {
    lines.push(...formatMonthlyFacts(dayStem, date));
  }

  return lines.join("\n");
}

function formatZiweiFacts(
  calculation: FortuneCalculation,
  date: LocalDateParts,
): string {
  const { ziwei } = calculation;
  const nominalAge = date.year - ziwei.solarYear + 1;
  const currentDaxian = getDaxianList(ziwei).find(
    (item) => nominalAge >= item.ageStart && nominalAge <= item.ageEnd,
  );
  const liunian = calculateLiunian(ziwei, date.year);
  const shenPalace = Object.values(ziwei.palaces).find((palace) => palace.isShenGong);
  const lines = [
    "# 검증된 자미두수 사실",
    formatPalaceFact("명궁", ziwei.palaces["命宮"]),
    shenPalace
      ? `- 신궁: ${shenPalace.name} ${shenPalace.ganZhi}, ${formatStars(shenPalace)}`
      : "- 신궁: 계산 결과 없음",
    formatPalaceFact("재백궁", ziwei.palaces["財帛"]),
    formatPalaceFact("관록궁", ziwei.palaces["官祿"]),
    formatPalaceFact("부처궁", ziwei.palaces["夫妻"]),
    formatPalaceFact("전택궁", ziwei.palaces["田宅"]),
  ];

  if (currentDaxian) {
    lines.push(
      `- 현재 대한: ${currentDaxian.ageStart}~${currentDaxian.ageEnd}세 ${currentDaxian.palaceName} ${currentDaxian.ganZhi}, 주성 ${currentDaxian.mainStars.join(" ") || "공궁"}`,
    );
  }

  lines.push(
    `- ${date.year}년 유년: 명궁 지지 ${liunian.mingGongZhi}, 본명반의 ${liunian.natalPalaceAtMing}에 해당, 현재 대한 ${liunian.daxianPalaceName} ${liunian.daxianAgeStart}~${liunian.daxianAgeEnd}세`,
    `- ${date.year}년 사화 궁위: ${Object.entries(liunian.siHuaPalaces).map(([type, palace]) => `${type} ${palace}`).join(", ")}`,
  );

  return lines.join("\n");
}

function formatWesternFacts(calculation: FortuneCalculation): string {
  const { natal } = calculation;
  const selectedPlanets = ["Sun", "Moon", "Mercury", "Venus", "Mars"];
  const planets = selectedPlanets
    .map((id) => natal.planets.find((planet) => planet.id === id))
    .filter((planet): planet is PlanetPosition => Boolean(planet));
  const lines = ["# 검증된 서양 점성술 사실"];

  if (natal.angles) {
    lines.push(
      `- 상승궁: ${ZODIAC_KO[natal.angles.asc.sign] ?? natal.angles.asc.sign}`,
      `- 중천점(MC): ${ZODIAC_KO[natal.angles.mc.sign] ?? natal.angles.mc.sign}`,
    );
  }

  lines.push(
    ...planets.map(
      (planet) =>
        `- ${PLANET_KO[planet.id] ?? planet.id}: ${ZODIAC_KO[planet.sign] ?? planet.sign}${planet.house ? `, ${planet.house}하우스` : ""}`,
    ),
    `- 주요 애스펙트 상위 6개: ${natal.aspects
      .slice(0, 6)
      .map((aspect) => `${PLANET_KO[aspect.planet1] ?? aspect.planet1}-${aspect.type}-${PLANET_KO[aspect.planet2] ?? aspect.planet2}(오브 ${aspect.orb.toFixed(1)}도)`)
      .join(", ")}`,
    "- 현재 트랜짓 자료는 없으므로 올해·이번 달·오늘의 서양 점성술 흐름을 단정하지 않음",
  );

  return lines.join("\n");
}

function countVisibleElements(
  pillars: FortuneCalculation["saju"]["pillars"],
): Map<string, number> {
  const counts = new Map<string, number>();

  for (const item of pillars) {
    increment(counts, STEM_INFO[item.pillar.stem].element);
    increment(counts, BRANCH_ELEMENT[item.pillar.branch]);
  }

  return counts;
}

function increment(counts: Map<string, number>, key: string): void {
  counts.set(key, (counts.get(key) ?? 0) + 1);
}

function formatElementCounts(counts: Map<string, number>): string {
  return ["tree", "fire", "earth", "metal", "water"]
    .map((element) => `${ELEMENT_NAMES[element]} ${counts.get(element) ?? 0}`)
    .join(", ");
}

function findCurrentDaewoon(
  daewoon: FortuneCalculation["saju"]["daewoon"],
  currentYear: number,
) {
  return [...daewoon]
    .reverse()
    .find((item) => item.startDate.getFullYear() <= currentYear);
}

function formatRelationFacts(
  pairs: FortuneCalculation["saju"]["relations"]["pairs"],
): string[] {
  const counts = new Map<string, number>();

  for (const relation of pairs.values()) {
    for (const item of relation.stem) {
      increment(counts, `천간 ${item.type}${item.detail ? `(${item.detail})` : ""}`);
    }
    for (const item of relation.branch) {
      increment(counts, `지지 ${item.type}${item.detail ? `(${item.detail})` : ""}`);
    }
  }

  if (counts.size === 0) return ["- 원국 합·충·형·파·해: 표시된 관계 없음"];

  return [
    `- 원국 합·충·형·파·해: ${[...counts.entries()].map(([name, count]) => `${name} ${count}쌍`).join(", ")}`,
    "- 자형은 불행 예언이 아니라 반복 사고·자기 압박·통제·완성도 추구 가능성으로만 해석",
  ];
}

function formatDailyFacts(
  natalDayGanzi: string,
  dayStem: string,
  date: LocalDateParts,
): string[] {
  const [, , dayGanzi] = getFourPillars(
    date.year,
    date.month,
    date.day,
    12,
    0,
  );
  const relation = analyzePillarRelations(natalDayGanzi, dayGanzi);

  return [
    `- 오늘 일진: ${date.isoDate} ${dayGanzi}, 일간 기준 천간 ${getRelation(dayStem, dayGanzi[0])?.hanja ?? "알 수 없음"}, 지지 정기 기준 ${getRelation(dayStem, getJeonggi(dayGanzi[1]))?.hanja ?? "알 수 없음"}`,
    `- 일주와 오늘의 관계: ${formatPairRelation(relation)}`,
  ];
}

function formatMonthlyFacts(
  dayStem: string,
  date: LocalDateParts,
): string[] {
  const [, monthGanzi] = getFourPillars(
    date.year,
    date.month,
    date.day,
    12,
    0,
  );

  return [
    `- 이번 달 월주: ${monthGanzi}, 일간 기준 천간 ${getRelation(dayStem, monthGanzi[0])?.hanja ?? "알 수 없음"}, 지지 정기 기준 ${getRelation(dayStem, getJeonggi(monthGanzi[1]))?.hanja ?? "알 수 없음"}`,
  ];
}

function formatPairRelation(relation: PairRelation): string {
  const parts = [
    ...relation.stem.map((item) => `천간 ${item.type}${item.detail ? `(${item.detail})` : ""}`),
    ...relation.branch.map((item) => `지지 ${item.type}${item.detail ? `(${item.detail})` : ""}`),
  ];

  return parts.length > 0 ? parts.join(", ") : "표시된 합·충·형·파·해 없음";
}

function formatPalaceFact(label: string, palace?: ZiweiPalace): string {
  return palace
    ? `- ${label}: ${palace.ganZhi}, ${formatStars(palace)}`
    : `- ${label}: 계산 결과 없음`;
}

function formatStars(palace: ZiweiPalace): string {
  const stars = palace.stars.filter((star) => MAIN_STAR_NAMES.has(star.name));
  return stars
    .map((star) => `${star.name}${star.brightness ? ` ${star.brightness}` : ""}${star.siHua ? ` ${star.siHua}` : ""}`)
    .join(", ") || "주성 공궁";
}

function localDateParts(date: Date, timezone: string): LocalDateParts {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number.parseInt(parts.find((part) => part.type === type)?.value ?? "0", 10);
  const year = get("year");
  const month = get("month");
  const day = get("day");

  return {
    year,
    month,
    day,
    isoDate: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
  };
}
