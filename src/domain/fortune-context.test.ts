import { describe, expect, it } from "vitest";
import { generateFortuneContext } from "./fortune-context.js";

describe("generateFortuneContext", () => {
  it("returns the same AI-copy chart sections used by sky.told.me", async () => {
    const text = await generateFortuneContext({
      year: 1988,
      month: 4,
      day: 19,
      hour: 8,
      minute: 30,
      gender: "M",
      birthplace: "서울",
    });

    expect(text).toContain("AI 상담 지침");
    expect(text).toContain("四柱八字 (男)");
    expect(text).toContain("八字關係");
    expect(text).toContain("時-日: 辰辰刑(自刑)");
    expect(text).toContain("神殺");
    expect(text).toContain("坐法 (장간 → 운성)");
    expect(text).toContain("引從法 (누락 십성의 양간 인종)");
    expect(text).toContain("紫微斗數 命盤 (男)");
    expect(text).toContain("四化");
    expect(text).toContain("Natal Chart");
    expect(text).toContain("Houses (Placidus)");
    expect(text).toContain("ASC  ♊ Gemini 16°45'");
    expect(text).toContain("MC  ♒ Aquarius 24°28'");
    expect(text).toMatch(/♄ Saturn\s+♑ Capricorn\s+2°30' R\s+VII/);
    expect(text).toContain("저장하지 않습니다");
  });

  it("reproduces the pasted natal angles when explicit coordinates match that chart", async () => {
    const text = await generateFortuneContext({
      year: 1988,
      month: 4,
      day: 19,
      hour: 8,
      minute: 30,
      gender: "M",
      birthplace: "직접입력",
      latitude: 37.5665,
      longitude: 124.97,
      timezone: "Asia/Seoul",
    });

    expect(text).toContain("ASC  ♊ Gemini 14°42'");
    expect(text).toContain("MC  ♒ Aquarius 22°24'");
    expect(text).toMatch(/♄ Saturn\s+♑ Capricorn\s+2°30' R\s+VIII/);
  });
});
