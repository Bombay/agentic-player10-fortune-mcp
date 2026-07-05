import { ELEMENT_HANJA, MAIN_STAR_NAMES, PALACE_NAMES, PILLAR_NAMES } from "@orrery/core/constants";
import { ASPECT_SYMBOLS, formatDegree, PLANET_SYMBOLS, ROMAN, ZODIAC_SYMBOLS } from "@orrery/core/natal";
import type { NatalChart, SajuResult, ZiweiChart } from "@orrery/core/types";
import { getDaxianList } from "@orrery/core/ziwei";

const KO: Record<string, string> = {
  "saju.sipsin": "십신",
  "saju.cheongan": "천간",
  "saju.jiji": "지지",
  "saju.unseong": "운성",
  "saju.janggan": "장간",
  "saju.gongmang": "공망",
  "saju.unknownTimeWarning":
    "출생 시간 없이 정오(12:00) 기준으로 계산하여 대운 시작 시기에 수개월 오차가 있을 수 있습니다.",
  "saju.ageSuffix": "세",
  "saju.sal.cheonul": "천을귀인",
  "saju.sal.cheonduk": "천덕귀인",
  "saju.sal.wolduk": "월덕귀인",
  "saju.sal.munchang": "문창귀인",
  "saju.sal.geumyeo": "금여록",
  "saju.sal.yangin": "양인살",
  "saju.sal.dohwa": "도화살",
  "saju.sal.baekho": "백호살",
  "saju.sal.goegang": "괴강살",
  "saju.sal.hongyeom": "홍염살",
  "saju.injong.desc": "— 누락 십성의 양간 인종",
};

const EN: Record<string, string> = {
  "natal.unknownTime": "Calculated based on noon (12:00) without birth time.",
  "planet.Sun": "Sun",
  "planet.Moon": "Moon",
  "planet.Mercury": "Mercury",
  "planet.Venus": "Venus",
  "planet.Mars": "Mars",
  "planet.Jupiter": "Jupiter",
  "planet.Saturn": "Saturn",
  "planet.Uranus": "Uranus",
  "planet.Neptune": "Neptune",
  "planet.Pluto": "Pluto",
  "planet.Chiron": "Chiron",
  "planet.NorthNode": "North Node",
  "planet.SouthNode": "South Node",
  "planet.Fortuna": "Fortuna",
  "zodiac.Aries": "Aries",
  "zodiac.Taurus": "Taurus",
  "zodiac.Gemini": "Gemini",
  "zodiac.Cancer": "Cancer",
  "zodiac.Leo": "Leo",
  "zodiac.Virgo": "Virgo",
  "zodiac.Libra": "Libra",
  "zodiac.Scorpio": "Scorpio",
  "zodiac.Sagittarius": "Sagittarius",
  "zodiac.Capricorn": "Capricorn",
  "zodiac.Aquarius": "Aquarius",
  "zodiac.Pisces": "Pisces",
};

const LUCKY_ZIWEI_STARS = new Set(["左輔", "右弼", "文昌", "文曲", "天魁", "天鉞", "祿存", "天馬"]);

function tKo(key: string): string {
  return KO[key] ?? key;
}

function tEn(key: string): string {
  return EN[key] ?? key;
}

function fmt2(value: string): string {
  return value.length === 1 ? ` ${value} ` : value;
}

export function sajuToText(result: SajuResult): string {
  const { input, pillars, daewoon, relations, specialSals, gongmang } = result;
  const lines: string[] = [];
  const genderChar = input.gender === "M" ? "男" : "女";

  lines.push(`四柱八字 (${genderChar})`);
  lines.push("─────");

  const labels = ["時柱", "日柱", "月柱", "年柱"];
  const unknownTime = input.unknownTime;

  lines.push(`       ${labels.join("    ")}`);
  lines.push("─────");
  lines.push(`${tKo("saju.sipsin")}   ${pillars.map((p, i) => fmt2(i === 0 && unknownTime ? "? " : p.stemSipsin)).join("    ")}`);
  lines.push(`${tKo("saju.cheongan")}     ${pillars.map((p, i) => (i === 0 && unknownTime ? "?" : p.pillar.stem)).join("      ")}`);
  lines.push(`${tKo("saju.jiji")}     ${pillars.map((p, i) => (i === 0 && unknownTime ? "?" : p.pillar.branch)).join("      ")}`);
  lines.push(`${tKo("saju.sipsin")}   ${pillars.map((p, i) => fmt2(i === 0 && unknownTime ? "? " : p.branchSipsin)).join("    ")}`);
  lines.push("─────");
  lines.push(`${tKo("saju.unseong")}   ${pillars.map((p, i) => fmt2(i === 0 && unknownTime ? "? " : p.unseong)).join("    ")}`);
  const gongmangSet = new Set(gongmang.branches);
  lines.push(`${tKo("saju.gongmang")}   ${pillars.map((p, i) => fmt2(i === 0 && unknownTime ? "? " : i !== 1 && gongmangSet.has(p.pillar.branch) ? "空 " : "  ")).join("    ")}`);
  lines.push(`${tKo("saju.janggan")}  ${pillars.map((p, i) => (i === 0 && unknownTime ? "  ?  " : p.jigang)).join("  ")}`);
  lines.push(`${tKo("saju.gongmang")}: ${gongmang.branches[0]}${gongmang.branches[1]}`);
  lines.push("");

  const relationLines = formatSajuRelations(result);
  if (relationLines.length > 0) {
    lines.push("八字關係");
    lines.push("─────");
    lines.push(...relationLines);
    lines.push("");
  }

  const salItems = formatSpecialSals(specialSals);
  if (salItems.length > 0) {
    lines.push("神殺");
    lines.push("─────");
    lines.push(salItems.join(" · "));
    lines.push("");
  }

  if (result.jwabeop) {
    lines.push(`坐法 (${tKo("saju.janggan")} → ${tKo("saju.unseong")})`);
    lines.push("─────");
    const pillarLabels = ["時柱", "日柱", "月柱", "年柱"];
    result.jwabeop.forEach((entries, index) => {
      if (index === 0 && input.unknownTime) return;
      const parts = entries.map((entry) => `${entry.stem}(${entry.sipsin}·${entry.unseong}坐)`).join(" ");
      lines.push(`${pillarLabels[index]}: ${parts}`);
    });
    lines.push("");
  }

  if (result.injongbeop && result.injongbeop.length > 0) {
    lines.push(`引從法 (${tKo("saju.injong.desc").replace(/^— /, "")})`);
    lines.push("─────");
    lines.push(result.injongbeop.map((entry) => `${entry.yangStem} ${entry.category} → ${entry.unseong}從`).join(" · "));
    lines.push("");
  }

  if (daewoon.length > 0) {
    lines.push(input.unknownTime ? `大運 (${tKo("saju.unknownTimeWarning")})` : "大運");
    lines.push("─────");
    for (const item of daewoon) {
      const gongmangMark = item.isGongmang ? " 空" : "";
      lines.push(
        `${String(item.index).padStart(2)}運 (${String(item.age).padStart(2)}${tKo("saju.ageSuffix")})  ${fmt2(item.stemSipsin)}  ${item.ganzi}  ${fmt2(item.branchSipsin)}  (${item.startDate.getFullYear()}年)${gongmangMark}`,
      );
    }
  }

  return lines.join("\n");
}

function formatSajuRelations(result: SajuResult): string[] {
  const pairNames: Record<string, string> = {
    "0,1": "時-日",
    "0,2": "時-月",
    "0,3": "時-年",
    "1,2": "日-月",
    "1,3": "日-年",
    "2,3": "月-年",
  };
  const ganzis = result.pillars.map((pillar) => pillar.pillar.ganzi);
  const lines: string[] = [];

  result.relations.pairs.forEach((relation, key) => {
    const [iText, jText] = key.split(",");
    const i = Number(iText);
    const j = Number(jText);
    const parts: string[] = [];

    for (const item of relation.stem) {
      const detail = item.detail && ELEMENT_HANJA[item.detail] ? ELEMENT_HANJA[item.detail] : "";
      parts.push(`${ganzis[i][0]}${ganzis[j][0]}${item.type}${detail}`);
    }
    for (const item of relation.branch) {
      const detail = item.detail && ELEMENT_HANJA[item.detail]
        ? ELEMENT_HANJA[item.detail]
        : item.detail
          ? `(${item.detail})`
          : "";
      parts.push(`${ganzis[i][1]}${ganzis[j][1]}${item.type}${detail}`);
    }

    if (parts.length > 0) {
      lines.push(`${pairNames[key] ?? key}: ${parts.join(", ")}`);
    }
  });

  for (const relation of result.relations.triple) {
    const element = relation.detail && ELEMENT_HANJA[relation.detail] ? ELEMENT_HANJA[relation.detail] : "";
    lines.push(`${relation.type}${element}局`);
  }
  for (const relation of result.relations.directional) {
    const element = relation.detail && ELEMENT_HANJA[relation.detail] ? ELEMENT_HANJA[relation.detail] : "";
    lines.push(`${relation.type}${element}`);
  }

  return lines;
}

function formatSpecialSals(specialSals: SajuResult["specialSals"]): string[] {
  const items: string[] = [];

  if (specialSals.cheonul.length > 0) items.push(`${tKo("saju.sal.cheonul")}(${specialSals.cheonul.map((i) => PILLAR_NAMES[i]).join(",")})`);
  if (specialSals.cheonduk.length > 0) items.push(`${tKo("saju.sal.cheonduk")}(${specialSals.cheonduk.map((i) => PILLAR_NAMES[i]).join(",")})`);
  if (specialSals.wolduk.length > 0) items.push(`${tKo("saju.sal.wolduk")}(${specialSals.wolduk.map((i) => PILLAR_NAMES[i]).join(",")})`);
  if (specialSals.munchang.length > 0) items.push(`${tKo("saju.sal.munchang")}(${specialSals.munchang.map((i) => PILLAR_NAMES[i]).join(",")})`);
  if (specialSals.geumyeo.length > 0) items.push(`${tKo("saju.sal.geumyeo")}(${specialSals.geumyeo.map((i) => PILLAR_NAMES[i]).join(",")})`);
  if (specialSals.yangin.length > 0) items.push(`${tKo("saju.sal.yangin")}(${specialSals.yangin.map((i) => PILLAR_NAMES[i]).join(",")})`);
  if (specialSals.dohwa.length > 0) items.push(`${tKo("saju.sal.dohwa")}(${specialSals.dohwa.map((i) => PILLAR_NAMES[i]).join(",")})`);
  if (specialSals.baekho) items.push(tKo("saju.sal.baekho"));
  if (specialSals.goegang) items.push(tKo("saju.sal.goegang"));
  if (specialSals.hongyeom) items.push(tKo("saju.sal.hongyeom"));

  return items;
}

export function ziweiToText(chart: ZiweiChart): string {
  const lines: string[] = [];
  const genderChar = chart.isMale ? "男" : "女";

  lines.push(`紫微斗數 命盤 (${genderChar})`);
  lines.push("═════");
  lines.push("");
  lines.push(`年柱: ${chart.yearGan}${chart.yearZhi}`);

  const mingPalace = chart.palaces["命宮"];
  lines.push(`命宮: ${mingPalace?.gan ?? ""}${mingPalace?.zhi ?? ""}`);

  const shenPalaceName = Object.values(chart.palaces).find((palace) => palace.isShenGong)?.name ?? "";
  lines.push(`身宮: ${shenPalaceName} (${chart.shenGongZhi})`);
  lines.push(`五行局: ${chart.wuXingJu.name}`);
  lines.push(`大限起始: ${chart.daXianStartAge}歲`);
  lines.push("");

  lines.push("十二宮");
  lines.push("─────");
  for (const palaceName of PALACE_NAMES) {
    const palace = chart.palaces[palaceName];
    if (!palace) continue;

    const shenMark = palace.isShenGong ? "·身" : "  ";
    const mainStars = palace.stars.filter((star) => MAIN_STAR_NAMES.has(star.name));
    const auxStars = palace.stars.filter((star) => !MAIN_STAR_NAMES.has(star.name));
    const mainText = mainStars.length > 0
      ? mainStars.map((star) => [star.name, star.brightness, star.siHua].filter((part) => part.length > 0).join(" ")).join(", ")
      : "(空宮)";

    lines.push(`${palace.name}${shenMark} ${palace.ganZhi}  ${mainText}`);

    if (auxStars.length > 0) {
      const lucky = auxStars.filter((star) => LUCKY_ZIWEI_STARS.has(star.name)).map((star) => star.name);
      const sha = auxStars.filter((star) => !LUCKY_ZIWEI_STARS.has(star.name)).map((star) => star.name);
      const parts: string[] = [];
      if (lucky.length > 0) parts.push(`吉: ${lucky.join(" ")}`);
      if (sha.length > 0) parts.push(`煞: ${sha.join(" ")}`);
      if (parts.length > 0) lines.push(`          ${parts.join(" | ")}`);
    }
  }

  lines.push("");
  lines.push("四化");
  lines.push("─────");
  for (const huaType of ["化祿", "化權", "化科", "化忌"]) {
    for (const palace of Object.values(chart.palaces)) {
      for (const star of palace.stars) {
        if (star.siHua === huaType) {
          lines.push(`${huaType}: ${star.name} 在 ${palace.name}`);
        }
      }
    }
  }

  lines.push("");
  lines.push("大限");
  lines.push("─────");
  for (const item of getDaxianList(chart)) {
    const stars = item.mainStars.length > 0 ? item.mainStars.join(" ") : "(空宮)";
    lines.push(`${String(item.ageStart).padStart(3)}-${String(item.ageEnd).padStart(3)}歲  ${item.palaceName}  ${item.ganZhi}  ${stars}`);
  }

  return lines.join("\n");
}

export function natalToText(chart: NatalChart, houseSystemName = "Placidus"): string {
  const lines: string[] = [];
  const hasHouses = chart.angles != null;

  lines.push("Natal Chart");
  if (!hasHouses) lines.push(`(${tEn("natal.unknownTime")})`);
  lines.push("═════");
  lines.push("");

  if (chart.angles) {
    lines.push("Angles");
    lines.push("─────");
    for (const [label, angle] of [["ASC", chart.angles.asc], ["MC", chart.angles.mc]] as const) {
      lines.push(`${label}  ${ZODIAC_SYMBOLS[angle.sign]} ${tEn(`zodiac.${angle.sign}`)} ${formatDegree(angle.longitude)}`);
    }
    lines.push("");
  }

  lines.push("Planets");
  lines.push("─────");
  for (const planet of chart.planets) {
    const retrograde = planet.isRetrograde ? " R" : "  ";
    const housePart = planet.house != null ? ` ${ROMAN[planet.house - 1].padStart(5)}` : "";
    lines.push(
      `${PLANET_SYMBOLS[planet.id]} ${tEn(`planet.${planet.id}`).padEnd(10)} ${ZODIAC_SYMBOLS[planet.sign]} ${tEn(`zodiac.${planet.sign}`).padEnd(12)} ${formatDegree(planet.longitude)}${retrograde}${housePart}`,
    );
  }
  lines.push("");

  if (hasHouses && chart.houses.length > 0) {
    lines.push(`Houses (${houseSystemName})`);
    lines.push("─────");
    for (const house of chart.houses) {
      lines.push(`${ROMAN[house.number - 1].padStart(4)}  ${ZODIAC_SYMBOLS[house.sign]} ${tEn(`zodiac.${house.sign}`).padEnd(12)} ${formatDegree(house.cuspLongitude)}`);
    }
    lines.push("");
  }

  lines.push("Major Aspects");
  lines.push("─────");
  for (const aspect of chart.aspects.slice(0, 15)) {
    lines.push(
      `${PLANET_SYMBOLS[aspect.planet1]} ${tEn(`planet.${aspect.planet1}`).padEnd(10)} ${ASPECT_SYMBOLS[aspect.type]} ${PLANET_SYMBOLS[aspect.planet2]} ${tEn(`planet.${aspect.planet2}`).padEnd(10)} orb ${aspect.orb.toFixed(1)}°`,
    );
  }

  return lines.join("\n");
}
