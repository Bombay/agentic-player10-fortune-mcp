# Feasibility Review

Updated: 2026-07-05

## Key Finding: Orrery / sky.told.me

The reference service at `https://sky.told.me/` is a strong implementation proof for the selected fortune MCP.

Observed on 2026-07-05:

- The live HTML loads one bundled JavaScript module: `/assets/index-CrbvdjiE.js`.
- The HTML metadata describes the service as a browser-based tool for Saju, Zi Wei Dou Shu, and Western natal charts.
- The deployed bundle is about 1 MB.
- The bundle contains Korean UI text saying all calculations are processed in the browser and input data is not sent to a server.
- The bundle contains "AI 해석용 전부 복사" behavior that joins Saju + Zi Wei Dou Shu + Natal Chart text.
- The only `fetch(` occurrence observed in the minified bundle is the Vite/modulepreload helper, not a calculation API call.
- The source repository README confirms the tool calculates all three systems without a backend.
- The source repository exposes `@orrery/core` with:
  - `calculateSaju` from `@orrery/core/saju`
  - `createChart` from `@orrery/core/ziwei`
  - `calculateNatal` from `@orrery/core/natal`

Conclusion:

- A single MCP tool can realistically return all three calculation results in one response.
- The MCP should be an information provider. It should not decide the user's reading itself.
- The host AI should interpret the returned chart context and answer the user's concern.

Important caveat:

- Orrery and `@orrery/core` are licensed `AGPL-3.0-only`.
- If we use or modify this code/package, the MCP source should be public under AGPL-compatible terms, preserve notices, and clearly state changes.
- This is acceptable for a contest GitHub submission if we intentionally open-source the MCP, but it should be an explicit product/legal decision.

## Key Finding: PlayMCP Catalog

The MCP discovery idea is more feasible than initially assumed because PlayMCP exposes a public MCP list endpoint used by its web app.

Observed endpoint:

```text
GET https://playmcp.kakao.com/api/v1/mcps?page=0&sortBy=FEATURED_LEVEL&pageSize=12
```

Observed response:

- HTTP 200 without login.
- `totalElements`: `228`
- `totalPages`: `19`
- Each MCP includes `id`, `name`, `description`, `starterMessages`, `formattedTools`, `identifyName`, `featuredLevel`, `monthlyToolCallCount`, `totalToolCallCount`, `authConfigSummary`, `teamProfile`, and `image`.

This means a discovery MCP can inspect public MCPs and their tools without manually maintaining the entire catalog.

## Important Caveat

The endpoint is discoverable from the public PlayMCP web app, but it is not documented in `llms.txt` as a stable public API. Before submission, we should confirm with PlayMCP/Kakao whether using it from another MCP server is acceptable.

Recommended fallback:

- Treat PlayMCP as the source of truth when available.
- Cache normalized catalog snapshots in our own datastore.
- Keep a manual/curated seed catalog for demos if the endpoint changes.

## Discovery MCP Feasibility

### Strengths

- Can fetch public MCP catalog and tool metadata.
- Can search over tool names, descriptions, parameters, starter messages, usage counts, and team profile metadata.
- Can rank by intent match plus trust signals.
- Can explain recommendations with concrete tool-level evidence.
- Can use `monthlyToolCallCount` and `totalToolCallCount` as weak popularity signals.

### Risks

- Public API stability is not guaranteed.
- Auto-install into Kakao Tools/Toolbox is likely not available for our MCP.
- If PlayMCP restricts API access, the idea needs a cached catalog fallback.
- "Recommend another MCP" may be less emotionally sticky than a personal counseling product.

## Fortune / Astrology MCP Feasibility

### Strengths

- Very fast MVP.
- Text-only PlayMCP UX is sufficient.
- No storage is required for the preliminary MVP.
- Fits casual KakaoTalk-style questions and older user segments better than a developer/tooling idea.
- Easier to demo emotionally: career, relationship, money, health-adjacent worries.

### Risks

- Birth date, birth time, gender, and birthplace are sensitive profile data.
- Should avoid deterministic or harmful claims.
- The category is crowded, so differentiation must come from transparent multi-system interpretation.

Preliminary data design:

- Do not store profile data.
- Accept birth information as one-time input.
- Do not require OAuth or external datastore.
- Keep saved-profile behavior as a finalist expansion only.
- Make the answer style "reflection and entertainment" rather than factual prediction.

## Revised Product Judgment

The discovery MCP is technically feasible, but its competitive advantage depends on Kakao accepting public catalog API usage and valuing ecosystem infrastructure.

The fortune MCP is technically simpler and may be more effective for user retention and Kakao app engagement. It is less ecosystem-strategic, but more immediately understandable to broad Kakao users.

## Decision

The main project is the fortune / astrology counseling MCP.

Rationale:

- It has stronger accessibility for broad KakaoTalk users.
- It does not depend on an install UI for other MCPs.
- It can pass preliminary review without profile storage or authentication.
- It is easier to implement within the preliminary submission timeline.
- It can still expand into richer Kakao Tools widgets in the finals.

The MCP discovery concierge remains a secondary idea only.
