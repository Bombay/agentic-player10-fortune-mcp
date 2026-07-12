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
    guidance.push(
      "- 자미두수는 궁을 삶의 영역, 주성을 그 영역에서 드러나는 방식으로 연결하고 왕·묘·함을 단순한 길흉으로 단정하지 않음",
      "- 사화와 대한·유년은 해당 궁의 주제가 두드러질 가능성으로만 해석하고 사건 발생을 예언하지 않음",
    );
  }
  if (factContext.includes("# 검증된 서양 점성술 사실")) {
    guidance.push(
      "- 서양 점성술은 행성을 무엇, 별자리를 어떻게, 하우스를 어느 삶의 영역으로 연결하고 애스펙트는 두 기능의 상호작용으로 해석",
      "- 현재 트랜짓 자료가 없으면 출생차트만으로 올해·이번 달·오늘의 사건이나 시기를 예언하지 않음",
    );
  }
  if (factContext.includes("같은 결론의 보조 근거")) {
    guidance.push(
      "- 여러 체계는 서로 같은 성향이나 선택 과제를 가리킬 때만 연결하고 각 체계의 결론을 억지로 하나로 만들지 않음",
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
      `- ${dayMaster} 일간: ${DAY_MASTER_GUIDANCE[dayMaster]}으로 연결하되 실제 성격을 확정하지 않음`,
    );
  }

  const tenGods = selectRelevantTenGods(factContext);
  for (const tenGod of tenGods) {
    guidance.push(`- ${tenGod}: ${TEN_GOD_GUIDANCE[tenGod]}`);
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
