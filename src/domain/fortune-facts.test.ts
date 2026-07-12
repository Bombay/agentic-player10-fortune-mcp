import { describe, expect, it } from "vitest";
import { calculateFortune } from "./fortune-calculation.js";
import { detectReadingFocus, formatFortuneFacts } from "./fortune-facts.js";

const birthInput = {
  year: 1988,
  month: 4,
  day: 19,
  hour: 8,
  minute: 30,
  gender: "M" as const,
  birthplace: "서울",
};

describe("detectReadingFocus", () => {
  it("recognizes explicit single-system requests", () => {
    expect(detectReadingFocus("사주팔자만 깊게 봐줘")).toBe("saju");
    expect(detectReadingFocus("자미두수로만 설명해줘")).toBe("ziwei");
    expect(detectReadingFocus("서양 점성술만 봐줘")).toBe("western");
  });

  it("uses combined facts for ordinary fortune questions", () => {
    expect(detectReadingFocus("올해 내 운세는 어때?")).toBe("combined");
  });
});

describe("formatFortuneFacts", () => {
  it("produces deterministic saju-only facts without other systems", async () => {
    const calculation = await calculateFortune(birthInput);
    const facts = formatFortuneFacts(
      calculation,
      "사주팔자만 깊게 봐줘",
      new Date("2026-07-12T00:00:00.000Z"),
    );

    expect(facts).toContain("2026년은 현재 진행 중인 올해이며 년주는 丙午");
    expect(facts).toContain("질문 범위: 사주팔자만 해석");
    expect(facts).toContain("원국: 시주 戊辰, 일주 甲辰, 월주 丙辰, 년주 戊辰");
    expect(facts).toContain("겉으로 드러난 오행 글자 수: 목 1, 화 1, 토 6, 금 0, 수 0");
    expect(facts).toContain("부족한 오행의 생활 보완을 판정하는 근거로 사용하지 않음");
    expect(facts).toContain("지지 刑(自刑) 6쌍");
    expect(facts).toContain("현재 대운: 2023년 시작 庚申");
    expect(facts).not.toContain("검증된 자미두수 사실");
    expect(facts).not.toContain("검증된 서양 점성술 사실");
  });

  it("adds a calculated day pillar for today's fortune", async () => {
    const calculation = await calculateFortune(birthInput);
    const facts = formatFortuneFacts(
      calculation,
      "오늘의 운세를 내 사주와 엮어서 봐줘",
      new Date("2026-07-12T00:00:00.000Z"),
    );

    expect(facts).toMatch(
      /오늘 일진: 2026-07-12 (?:甲|乙|丙|丁|戊|己|庚|辛|壬|癸)(?:子|丑|寅|卯|辰|巳|午|未|申|酉|戌|亥)/,
    );
    expect(facts).toContain("일주와 오늘의 관계:");
  });
});
