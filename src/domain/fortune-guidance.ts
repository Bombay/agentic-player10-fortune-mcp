const DAY_MASTER_GUIDANCE: Record<string, string> = {
  "甲木": "방향성·성장·큰 구조를 중시하는 경향",
  "乙木": "환경에 맞춰 연결하고 꾸준히 확장하는 경향",
  "丙火": "생각과 에너지를 밖으로 드러내고 확산하는 경향",
  "丁火": "한곳에 집중해 정교함과 지속성을 만드는 경향",
  "戊土": "기반·책임·장기적인 안정을 중시하는 경향",
  "己土": "세부를 조율하고 실무적으로 돌보는 경향",
  "庚金": "기준을 세우고 결단하며 불필요한 것을 정리하는 경향",
  "辛金": "품질·정확성·경계를 섬세하게 다듬는 경향",
  "壬水": "넓게 탐색하고 이동하며 가능성을 연결하는 경향",
  "癸水": "세밀하게 관찰하고 유연하게 스며드는 경향",
};

const TEN_GOD_GUIDANCE: Record<string, string> = {
  "比肩": "독립성·자기주도·동료 관계로 해석하되 고립이나 경쟁을 단정하지 않음",
  "劫財": "경쟁·연대·자원 분배의 과제로 해석하되 손재를 예언하지 않음",
  "食神": "표현·생산·돌봄·꾸준한 실행으로 해석하되 성과를 보장하지 않음",
  "傷官": "개선·비판적 사고·표현·기존 규칙의 재검토로 해석하되 충돌을 단정하지 않음",
  "偏財": "프로젝트·기회·유동적인 활동·자원 관리로 해석하되 부나 성공을 보장하지 않음",
  "正財": "예측 가능한 운영·생활 기반·지속적인 책임으로 해석하되 재산 규모를 단정하지 않음",
  "偏官": "압박·책임·경쟁·빠른 결단의 과제로 해석하되 사고나 불행을 예언하지 않음",
  "正官": "규칙·역할·신뢰·제도 안의 책임으로 해석하되 지위 상승을 보장하지 않음",
  "偏印": "비정형 학습·직관·관점 전환으로 해석하되 현실 도피를 단정하지 않음",
  "正印": "학습·보호·문서·회복 기반으로 해석하되 타인의 도움을 보장하지 않음",
};

const DAY_MASTER_KO: Record<string, string> = {
  "甲木": "갑목",
  "乙木": "을목",
  "丙火": "병화",
  "丁火": "정화",
  "戊土": "무토",
  "己土": "기토",
  "庚金": "경금",
  "辛金": "신금",
  "壬水": "임수",
  "癸水": "계수",
};

const TEN_GOD_KO: Record<string, string> = {
  "比肩": "비견",
  "劫財": "겁재",
  "食神": "식신",
  "傷官": "상관",
  "偏財": "편재",
  "正財": "정재",
  "偏官": "편관",
  "正官": "정관",
  "偏印": "편인",
  "正印": "정인",
};

const GANJI_READING: Record<string, string> = {
  "甲": "갑", "乙": "을", "丙": "병", "丁": "정", "戊": "무",
  "己": "기", "庚": "경", "辛": "신", "壬": "임", "癸": "계",
  "子": "자", "丑": "축", "寅": "인", "卯": "묘", "辰": "진", "巳": "사",
  "午": "오", "未": "미", "申": "신", "酉": "유", "戌": "술", "亥": "해",
};

const PALACE_GUIDANCE: Record<string, string> = {
  "命宮": "삶의 기본 성향과 대응 방식",
  "財帛": "돈과 자원을 다루는 방식",
  "官祿": "일과 사회적 역할",
  "夫妻": "가까운 관계와 협력 방식",
  "田宅": "집·생활 기반·자산 관리",
};

const MAIN_STAR_GUIDANCE: Record<string, [string, string]> = {
  "紫微": ["자미", "전체를 조율하고 책임지는 방식"],
  "天機": ["천기", "계획을 바꾸고 상황에 적응하는 방식"],
  "太陽": ["태양", "밖으로 표현하고 책임을 맡는 방식"],
  "武曲": ["무곡", "현실적으로 판단하고 실행하는 방식"],
  "天同": ["천동", "편안함과 공감을 중시하는 방식"],
  "廉貞": ["염정", "원칙과 욕구 사이를 조절하는 방식"],
  "天府": ["천부", "자원을 안정적으로 관리하는 방식"],
  "太陰": ["태음", "세심하게 살피고 차분히 축적하는 방식"],
  "貪狼": ["탐랑", "사람·정보·관심사를 연결하는 방식"],
  "巨門": ["거문", "질문하고 분석하며 말로 풀어내는 방식"],
  "天相": ["천상", "관계를 조율하고 균형을 맞추는 방식"],
  "天梁": ["천량", "보호하고 원칙을 지키는 방식"],
  "七殺": ["칠살", "부담이 큰 상황에서 빠르게 결단하는 방식"],
  "破軍": ["파군", "낡은 방식을 바꾸고 새로 구성하는 방식"],
};

const ZODIAC_GUIDANCE: Record<string, string> = {
  "양자리": "먼저 시작하고 직접 부딪쳐 보는 태도",
  "황소자리": "안정적으로 유지하고 감각적으로 확인하는 태도",
  "쌍둥이자리": "질문하고 말하며 여러 가능성을 연결하는 태도",
  "게자리": "보호하고 정서적 안전을 만드는 태도",
  "사자자리": "자신 있게 표현하고 창조하는 태도",
  "처녀자리": "분석하고 정리하며 개선하는 태도",
  "천칭자리": "관계의 균형과 협력을 맞추는 태도",
  "전갈자리": "깊이 몰입하고 변화를 통과하는 태도",
  "궁수자리": "더 넓은 의미와 경험을 탐색하는 태도",
  "염소자리": "책임과 구조를 세우고 오래 이어가는 태도",
  "물병자리": "기존 틀 밖에서 미래와 집단을 생각하는 태도",
  "물고기자리": "공감하고 상상하며 경계를 유연하게 보는 태도",
};

const HOUSE_GUIDANCE: Record<number, string> = {
  1: "자기표현과 첫인상", 2: "돈·소유·가치관", 3: "학습과 소통",
  4: "가정과 생활 기반", 5: "창작·즐거움·자기표현", 6: "일상 업무와 건강 습관",
  7: "동반자와 일대일 관계", 8: "공동 자원과 깊은 변화", 9: "학습·신념·먼 경험",
  10: "직업과 사회적 역할", 11: "팀·네트워크·공동 목표", 12: "내면·휴식·혼자 정리하는 시간",
};

const RELATION_GUIDANCE: Array<[string, string]> = [
  ["自刑", "자형은 반복 사고·자기 압박·통제·완성도 추구 가능성으로만 해석하고 사고를 예언하지 않음"],
  ["沖", "충은 긴장·이동·변화 압력으로 해석하되 이별이나 파괴를 단정하지 않음"],
  ["合", "합은 결합·협력·관심의 집중으로 해석하되 무조건 좋은 관계로 단정하지 않음"],
  ["刑", "형은 마찰·조정 과제로 해석하되 사고나 처벌을 예언하지 않음"],
  ["害", "해는 드러나지 않은 불일치로 해석하되 배신을 단정하지 않음"],
  ["破", "파는 균열·재조정 가능성으로 해석하되 실패를 단정하지 않음"],
];

const TEN_GOD_PATTERN = /比肩|劫財|食神|傷官|偏財|正財|偏官|正官|偏印|正印/g;

export function formatInterpretationGuidance(factContext: string): string {
  const guidance: string[] = [];

  if (factContext.includes("# 검증된 사주 사실")) {
    guidance.push(...formatSajuGuidance(factContext));
  }
  if (factContext.includes("# 검증된 자미두수 사실")) {
    guidance.push(...formatZiweiGuidance(factContext));
  }
  if (factContext.includes("# 검증된 서양 점성술 사실")) {
    guidance.push(...formatWesternGuidance(factContext));
  }
  if (factContext.includes("같은 결론의 보조 근거")) {
    guidance.push(
      "- 여러 체계는 서로 같은 성향이나 선택 과제를 가리킬 때만 연결하고 각 체계의 결론을 억지로 하나로 만들지 않음. 보조 체계의 전문용어와 별 이름은 최종 답변에 노출하지 않음",
    );
  }

  return ["# 질문별 해석 규칙", ...guidance].join("\n");
}

export function compactFortuneFacts(factContext: string): string {
  return factContext
    .split("\n")
    .filter(
      (line) =>
        !line.startsWith("- 아래") &&
        !line.startsWith("- 오행 글자 수는") &&
        !line.startsWith("- 지장간:") &&
        !line.startsWith("- 신살은"),
    )
    .join("\n");
}

function formatSajuGuidance(factContext: string): string[] {
  const guidance: string[] = [];
  const dayMaster = factContext.match(/^- 일간: ([甲乙丙丁戊己庚辛壬癸][木火土金水])/m)?.[1];

  if (dayMaster && DAY_MASTER_GUIDANCE[dayMaster]) {
    guidance.push(
      `- 사주 중심 근거 카드: 일간은 ${DAY_MASTER_KO[dayMaster]}. 일간은 사주의 중심 기준이며 시주·월주·년주와 다른 위치. ${DAY_MASTER_GUIDANCE[dayMaster]}으로 연결하되 실제 성격을 확정하지 않음`,
    );
  }

  const natalTenGods = factContext.match(/^- 천간 십신: (.+)$/m)?.[1];
  if (natalTenGods) {
    const translated = natalTenGods
      .replace(TEN_GOD_PATTERN, (tenGod) => TEN_GOD_KO[tenGod] ?? tenGod)
      .replaceAll("本元", "본원");
    guidance.push(
      `- 사주 위치 근거 카드: 천간 기준 ${translated}. 앞에 적힌 위치와 용어의 짝을 그대로 유지하고 일간과 합치지 않음`,
    );
  }

  const currentDaewoon = factContext.match(
    /^- 현재 대운: (\d{4})년 시작 ([甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]), 천간 (比肩|劫財|食神|傷官|偏財|正財|偏官|正官|偏印|正印), 지지 (比肩|劫財|食神|傷官|偏財|正財|偏官|正官|偏印|正印)$/m,
  );
  if (currentDaewoon) {
    guidance.push(
      `- 사주 현재 흐름 근거 카드: ${currentDaewoon[1]}년부터 ${readGanzi(currentDaewoon[2])} 대운. 천간은 ${TEN_GOD_KO[currentDaewoon[3]]}, 지지는 ${TEN_GOD_KO[currentDaewoon[4]]}. ${TEN_GOD_GUIDANCE[currentDaewoon[3]]}`,
    );
  }

  const currentYear = factContext.match(
    /^- 올해 세운: (\d{4})년 ([甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]), 일간 기준 천간 (比肩|劫財|食神|傷官|偏財|正財|偏官|正官|偏印|正印), 지지 정기 기준 (比肩|劫財|食神|傷官|偏財|正財|偏官|正官|偏印|正印)$/m,
  );
  if (currentYear) {
    guidance.push(
      `- 사주 올해 흐름 근거 카드: ${currentYear[1]}년은 ${readGanzi(currentYear[2])} 세운. 천간은 ${TEN_GOD_KO[currentYear[3]]}(${TEN_GOD_GUIDANCE[currentYear[3]].split("으로 해석")[0]}), 지지는 ${TEN_GOD_KO[currentYear[4]]}(${TEN_GOD_GUIDANCE[currentYear[4]].split("으로 해석")[0]}).`,
    );
  }

  const tenGods = selectRelevantTenGods(factContext);
  for (const tenGod of tenGods) {
    guidance.push(`- ${TEN_GOD_KO[tenGod]}: ${TEN_GOD_GUIDANCE[tenGod]}`);
  }

  const relationLine = factContext
    .split("\n")
    .find((line) => line.startsWith("- 원국 합·충·형·파·해:"));
  if (relationLine) {
    for (const [marker, explanation] of RELATION_GUIDANCE) {
      if (marker === "刑" && relationLine.includes("自刑")) continue;
      if (relationLine.includes(marker)) guidance.push(`- ${explanation}`);
    }
  }

  return guidance;
}

function formatZiweiGuidance(factContext: string): string[] {
  const guidance = [
    "- 자미두수 공통 규칙: 궁은 삶의 영역, 주성은 그 영역에서 드러나는 방식. 간지는 위치 이름이므로 갑자·경신 자체에 새 의미를 붙이지 않음",
  ];

  for (const label of ["명궁", "재백궁", "관록궁"] as const) {
    const line = factContext
      .split("\n")
      .find((item) => item.startsWith(`- ${label}:`));
    if (!line) continue;
    const star = Object.keys(MAIN_STAR_GUIDANCE).find((name) => line.includes(name));
    if (!star) continue;
    const palaceKey = { 명궁: "命宮", 재백궁: "財帛", 관록궁: "官祿" }[label];
    const [starKo, starMeaning] = MAIN_STAR_GUIDANCE[star];
    guidance.push(
      `- 자미두수 근거 카드: ${label}은 ${PALACE_GUIDANCE[palaceKey]} 영역. 주성 ${starKo}는 ${starMeaning}을 뜻함`,
    );
  }

  const daxian = factContext.match(
    /^- 현재 대한: (\d+~\d+세) ([命兄夫子財疾遷交官田福父][^ ]*) [^,]+, 주성 ([^\n]+)$/m,
  );
  if (daxian) {
    const palaceKey = Object.keys(PALACE_GUIDANCE).find((name) => daxian[2].includes(name));
    const star = Object.keys(MAIN_STAR_GUIDANCE).find((name) => daxian[3].includes(name));
    if (palaceKey && star) {
      const [starKo, starMeaning] = MAIN_STAR_GUIDANCE[star];
      guidance.push(
        `- 자미두수 현재 시기 근거 카드: ${daxian[1]}는 ${PALACE_GUIDANCE[palaceKey]} 영역의 흐름이며 주성 ${starKo}는 ${starMeaning}. 사건 발생을 단정하지 않음`,
      );
    }
  }

  return guidance;
}

function formatWesternGuidance(factContext: string): string[] {
  const guidance = [
    "- 출생차트 공통 규칙: 행성은 무엇을, 별자리는 어떻게, 하우스는 어느 삶의 영역에서 드러나는지를 뜻함. 현재 트랜짓이 없으면 올해 사건 근거로 쓰지 않음",
  ];

  for (const planet of ["태양", "달"] as const) {
    const match = factContext.match(
      new RegExp(`^- ${planet}: ([^,]+), (\\d+)하우스$`, "m"),
    );
    if (!match) continue;
    const signMeaning = ZODIAC_GUIDANCE[match[1]];
    const houseMeaning = HOUSE_GUIDANCE[Number(match[2])];
    if (!signMeaning || !houseMeaning) continue;
    const planetMeaning = planet === "태양" ? "삶의 중심 방향과 자기표현" : "감정과 안정 욕구";
    guidance.push(
      `- 출생차트 근거 카드: ${planet}은 ${planetMeaning}, ${match[1]}는 ${signMeaning}, ${match[2]}하우스는 ${houseMeaning} 영역을 뜻함`,
    );
  }

  return guidance;
}

function readGanzi(ganzi: string): string {
  return [...ganzi].map((character) => GANJI_READING[character] ?? character).join("");
}

function selectRelevantTenGods(factContext: string): string[] {
  const lines = factContext.split("\n");
  const priorityLines = lines.filter((line) =>
    /^- (현재 대운|올해 세운|오늘 일진|이번 달 월운):/.test(line),
  );
  const natalLines = lines.filter((line) => /십신:/.test(line));
  const ordered = [...priorityLines, ...natalLines]
    .flatMap((line) => line.match(TEN_GOD_PATTERN) ?? []);

  return [...new Set(ordered)].slice(0, 4);
}
