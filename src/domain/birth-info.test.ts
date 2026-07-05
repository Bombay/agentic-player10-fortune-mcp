import { describe, expect, it } from "vitest";
import { normalizeBirthInfo } from "./birth-info.js";

describe("normalizeBirthInfo", () => {
  it("defaults Korean timezone and Seoul coordinates", () => {
    const result = normalizeBirthInfo({
      year: 1993,
      month: 3,
      day: 12,
      hour: 9,
      minute: 45,
      gender: "M",
    });

    expect(result.timezone).toBe("Asia/Seoul");
    expect(result.latitude).toBe(37.5665);
    expect(result.longitude).toBe(126.978);
  });
});
