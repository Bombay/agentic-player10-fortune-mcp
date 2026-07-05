import { describe, expect, it } from "vitest";
import { normalizeBirthInfo } from "./birth-info.js";

describe("normalizeBirthInfo", () => {
  it("requires a birthplace instead of silently defaulting to Seoul", () => {
    expect(() =>
      normalizeBirthInfo({
        year: 1993,
        month: 3,
        day: 12,
        hour: 9,
        minute: 45,
        gender: "M",
      }),
    ).toThrow("birthplace is required");
  });

  it("resolves Seoul from the shared Orrery city database", () => {
    const result = normalizeBirthInfo({
      year: 1993,
      month: 3,
      day: 12,
      hour: 9,
      minute: 45,
      gender: "M",
      birthplace: "서울",
    });

    expect(result.birthplace).toBe("서울");
    expect(result.timezone).toBe("Asia/Seoul");
    expect(result.latitude).toBe(37.5665);
    expect(result.longitude).toBe(126.978);
  });

  it("rejects ambiguous city names unless the region is included", () => {
    expect(() =>
      normalizeBirthInfo({
        year: 1993,
        month: 3,
        day: 12,
        hour: 9,
        minute: 45,
        gender: "M",
        birthplace: "광주",
      }),
    ).toThrow("birthplace is ambiguous");
  });
});
