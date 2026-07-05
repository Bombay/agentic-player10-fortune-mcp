import { describe, expect, it } from "vitest";
import { generateFortuneContext } from "./fortune-context.js";

describe("generateFortuneContext", () => {
  it("returns all three chart sections and host AI guidance", async () => {
    const text = await generateFortuneContext({
      year: 1993,
      month: 3,
      day: 12,
      hour: 9,
      minute: 45,
      gender: "M",
    });

    expect(text).toContain("AI 상담 지침");
    expect(text).toContain("사주팔자");
    expect(text).toContain("자미두수");
    expect(text).toContain("서양 점성술");
    expect(text).toContain("저장하지 않습니다");
  });
});
