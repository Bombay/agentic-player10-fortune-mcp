import { describe, expect, it } from "vitest";
import { toolDefinition } from "./server.js";

describe("toolDefinition", () => {
  it("exposes one read-only fortune context tool", () => {
    expect(toolDefinition.name).toBe("generate_fortune_context");
    expect(toolDefinition.annotations.readOnlyHint).toBe(true);
    expect(toolDefinition.annotations.destructiveHint).toBe(false);
    expect(toolDefinition.annotations.idempotentHint).toBe(true);
    expect(toolDefinition.annotations.openWorldHint).toBe(false);
    expect(toolDefinition.description).toContain("Saju");
    expect(toolDefinition.description).toContain("host AI");
  });
});
