import { describe, expect, it } from "vitest";
import { toolDefinition } from "./server.js";

describe("toolDefinition", () => {
  it("exposes one read-only final fortune reading tool", () => {
    expect(toolDefinition.name).toBe("generate_fortune_context");
    expect(toolDefinition.annotations.readOnlyHint).toBe(true);
    expect(toolDefinition.annotations.destructiveHint).toBe(false);
    expect(toolDefinition.annotations.idempotentHint).toBe(false);
    expect(toolDefinition.annotations.openWorldHint).toBe(true);
    expect(toolDefinition.description).toContain("Saju");
    expect(toolDefinition.description).toContain("final user-facing answer");
    expect(toolDefinition.inputSchema.question).toBeDefined();
  });
});
