# Fortune Context MCP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a no-storage PlayMCP-compatible MCP server with one tool that returns Saju, Zi Wei Dou Shu, and Western natal chart context for host-AI interpretation.

**Architecture:** The app has a small domain core that normalizes birth input, calls `@orrery/core`, and formats AI-friendly Markdown. The MCP layer registers one read-only tool and the HTTP layer exposes Streamable HTTP for PlayMCP/Kakao Cloud deployment.

**Tech Stack:** Node.js 22+, TypeScript, `@modelcontextprotocol/sdk`, `@orrery/core`, Zod, Vitest.

## Global Constraints

- Language: Korean user-facing copy.
- License: AGPL-3.0-only when using `@orrery/core`.
- Preliminary MVP: no birth-profile storage, no DB, no OAuth.
- PlayMCP response content: TextContent only, Markdown recommended.
- MCP transport: Streamable HTTP.
- Tool count: one MVP tool, `generate_fortune_context`.
- Tool behavior: provide information; host AI performs final 상담/해석.
- Sensitive data: avoid persistence and echo only what is needed.

---

### Task 1: Project Scaffold and Input Contract

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `src/domain/birth-info.ts`
- Create: `src/domain/birth-info.test.ts`

**Interfaces:**
- Produces: `BirthInfoInput`, `NormalizedBirthInfo`, `normalizeBirthInfo(input: BirthInfoInput): NormalizedBirthInfo`

- [ ] **Step 1: Write the failing test**

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/domain/birth-info.test.ts`

Expected: FAIL because project/test files or `normalizeBirthInfo` are not implemented yet.

- [ ] **Step 3: Implement minimal scaffold and normalization**

Create a strict TypeScript project, add dependencies, and implement `normalizeBirthInfo` with required date/time/gender validation and Korean defaults.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/domain/birth-info.test.ts`

Expected: PASS.

---

### Task 2: Fortune Context Generator

**Files:**
- Create: `src/domain/fortune-context.ts`
- Create: `src/domain/fortune-context.test.ts`
- Modify: `src/domain/birth-info.ts`

**Interfaces:**
- Consumes: `normalizeBirthInfo(input)`
- Produces: `generateFortuneContext(input: BirthInfoInput): Promise<string>`

- [ ] **Step 1: Write the failing test**

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/domain/fortune-context.test.ts`

Expected: FAIL because `generateFortuneContext` is not implemented.

- [ ] **Step 3: Implement the generator**

Import `calculateSaju`, `createChart`, and `calculateNatal` from `@orrery/core`; format concise Markdown sections with stable helper functions that tolerate missing optional fields.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/domain/fortune-context.test.ts`

Expected: PASS.

---

### Task 3: MCP Tool and Streamable HTTP Server

**Files:**
- Create: `src/mcp/server.ts`
- Create: `src/http.ts`
- Create: `src/index.ts`
- Create: `src/mcp/server.test.ts`

**Interfaces:**
- Consumes: `generateFortuneContext(input)`
- Produces: `createMcpServer()`, `startHttpServer({ port })`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { toolDefinition } from "./server.js";

describe("toolDefinition", () => {
  it("exposes one read-only fortune context tool", () => {
    expect(toolDefinition.name).toBe("generate_fortune_context");
    expect(toolDefinition.annotations.readOnlyHint).toBe(true);
    expect(toolDefinition.annotations.destructiveHint).toBe(false);
    expect(toolDefinition.description).toContain("Saju");
    expect(toolDefinition.description).toContain("host AI");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/mcp/server.test.ts`

Expected: FAIL because the MCP server module is not implemented.

- [ ] **Step 3: Implement MCP registration and HTTP transport**

Register `generate_fortune_context` with English description, Zod input schema, PlayMCP annotations, and TextContent Markdown response. Expose `/mcp` over Streamable HTTP and `/healthz` for deployment checks.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/mcp/server.test.ts`

Expected: PASS.

---

### Task 4: Deployment and Verification Docs

**Files:**
- Create: `Dockerfile`
- Create: `.dockerignore`
- Create: `docs/testing-and-deployment.md`
- Modify: `README.md`
- Modify: `docs/contest-ssot.md`

**Interfaces:**
- Consumes: working `npm test`, `npm run build`, and `npm start`
- Produces: deployment instructions for Kakao Cloud / PlayMCP registration

- [ ] **Step 1: Write the failing verification**

Run: `npm run build`

Expected: FAIL until all TypeScript sources and package scripts are complete.

- [ ] **Step 2: Implement deployment files and docs**

Add a production Dockerfile for `linux/amd64`, document local tests, MCP Inspector usage, PlayMCP temporary registration, PlayMCP AI chat testing, and KakaoTalk/Kakao Tools availability.

- [ ] **Step 3: Run full verification**

Run: `npm test`

Run: `npm run build`

Run: `npm start` and check `GET /healthz`.

Expected: all commands exit 0 and `/healthz` returns JSON with `ok: true`.

---

## Self-Review

- Spec coverage: one no-storage tool, three calculation systems, TextContent Markdown, Streamable HTTP, deployment docs, and KakaoTalk testing note are covered.
- Placeholder scan: no TBD/TODO/later placeholders.
- Type consistency: `BirthInfoInput`, `NormalizedBirthInfo`, `generateFortuneContext`, `toolDefinition`, `createMcpServer`, and `startHttpServer` are defined before use.
