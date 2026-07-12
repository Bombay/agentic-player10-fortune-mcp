# Contest and Platform SSOT

Updated: 2026-07-12

This document is the single source of truth for Agentic Player 10 contest and PlayMCP platform constraints used by this project.

## Contest

- Contest name: Agentic Player 10.
- Host: Kakao.
- Preliminary submission requires a PlayMCP-registered MCP server.
- Preliminary submission period: 2026-06-15 to 2026-07-14.
- Finalist announcement: 2026-07-30.
- Final development period: 2026-07-30 to 2026-08-27.
- Public voting period: 2026-08-31 to 2026-09-28.
- Offline award ceremony: 2026-10-23 at Kakao AI Campus.
- Up to 2 MCP servers can be submitted per participant through the contest form.

## Submission Flow

1. Build an MCP server that follows the PlayMCP development guide.
2. Deploy it through PlayMCP in KC.
3. Register the issued endpoint in the PlayMCP developer console.
4. First save as temporary registration and test through PlayMCP AI chat.
5. Request review only after local and PlayMCP testing are complete.
6. After approval, change visibility from "only me" to public.
7. Submit the public PlayMCP MCP detail page URL through the contest page form.

## PlayMCP in KC

- PlayMCP in KC is the Kakao Cloud-hosted MCP server deployment service for the contest.
- It is free for contest use during a limited period.
- It can be used only for contest participation.
- Kakao may reclaim servers used outside the contest purpose or not submitted to the contest.
- Free hosting continues only for a limited period after the contest; paid continuation may require a business account or moving to another cloud.
- Account limit: 2 MCP servers.

## Deployment

Supported deployment paths:

- Git source build.
- Container image registration.

Git source build requirements:

- A Git repository URL is required.
- A Dockerfile must exist at the repository root or configured Dockerfile path.
- A branch/ref can be selected.
- A PAT is optional for private repositories.

Container image requirements:

- Image registry host, image name, and image tag are required.
- Registry username/password are needed for private registries.
- Image must be built for `linux/amd64`.
- Apple Silicon builds should use `docker build --platform linux/amd64 ...`.

Redeployment finding observed on 2026-07-05:

- Git source pushes do not automatically update an already deployed PlayMCP in KC server.
- PlayMCP in KC exposes create, start, stop, and delete flows, but no confirmed Git-source redeploy flow for an existing server.
- The safest redeployment strategy is to create a replacement PlayMCP in KC server from the latest Git source, verify its new endpoint, then update the existing PlayMCP developer console registration to that endpoint.
- Delete the old PlayMCP in KC server only after the replacement endpoint works in PlayMCP AI Chat.

Redeployment result on 2026-07-05:

- Current PlayMCP developer console endpoint: `https://fortune-context-mcp-v3.playmcp-endpoint.kakaocloud.io/mcp`
- Current PlayMCP in KC server: `fortune-context-mcp-v3`, ID `1445`, status `Active`.
- Rollback PlayMCP in KC server kept active: `fortune-context-mcp-v2`, ID `1443`, status `Active`.
- Old PlayMCP in KC server deleted to free the 2-server account limit: `fortune-context-mcp`, ID `1436`.
- Verified the current endpoint with MCP `tools/list` and a sample `generate_fortune_context` call using `birthplace: "Seoul"`.
- The PlayMCP developer console temporary registration was updated, information-loaded, and saved against the current endpoint.
- PlayMCP AI Chat successfully called `generate_fortune_context` and generated a career-change reading from an English-birthplace prompt.

## MCP Protocol Constraints

- Remote MCP server only.
- Publicly accessible URL/domain required.
- Streamable HTTP transport only.
- Supported MCP spec version range:
  - Minimum: `2025-03-26`
  - Maximum: `2025-11-25`
- Stateless MCP is recommended.
- If user authentication is needed, OAuth or custom header authentication should be supported.
- MCP Inspector should be used before submission.

## Tool Constraints

- Tool name length: 1 to 128 characters.
- Tool names may include only English letters, numbers, underscore, and hyphen.
- Tool names are case-sensitive.
- Duplicate tool names are not allowed.
- Recommended tool count per MCP: 3 to 10.
- Tool count must not exceed 20.
- Required tool metadata:
  - `name`
  - `description`
  - `inputSchema`
  - `annotations`
- Required annotation fields:
  - `title`
  - `readOnlyHint`
  - `destructiveHint`
  - `openWorldHint`
  - `idempotentHint`
- Descriptions should preferably be written in English.
- Descriptions should include the service name.
- Descriptions should stay under 1,024 characters.
- MCP server name and tool name must not include "kakao" anywhere, regardless of case.

## Response Constraints

- PlayMCP AI chat allows tool call response `content` only when it is `TextContent`.
- Markdown text is recommended.
- If an image should be shown, return a Markdown image URL in text.
- Raw API JSON dumps are discouraged.
- Results should be compact and human-readable.
- Tool errors should be converted into clean text.

## Operation Constraints

- Tool response speed target:
  - Average: within 100ms.
  - p99: within 3,000ms.
- Tool answers must not induce ad exposure.
- MCP servers with persistent connection issues, auth failures, or harmful behavior may be restricted or removed.

## External AI Decision

- No reviewed contest rule establishes a blanket ban on external AI or external APIs inside an MCP.
- Public winning MCP tool descriptions provide precedent for backend LLM and external moderation API use.
- The selected provider is Cloudflare Workers AI with `@cf/google/gemma-4-26b-a4b-it`.
- Workers AI currently includes a recurring free allocation of 10,000 Neurons per day.
- Cloudflare states that Workers AI Customer Content is not used to train models or improve Cloudflare or third-party services without explicit consent.
- The tool sets `openWorldHint: true` because it calls an external service.
- The tool sets `idempotentHint: false` because generated wording can vary.
- The code default remains a 2,800ms deadline to protect the PlayMCP response path, but Gemma 4 did not complete a rich answer within that budget.
- Local fact-card tests with thinking disabled observed complete-answer latency from about 5 to 15.5 seconds. Local quality testing therefore uses a 20,000ms timeout.
- Do not deploy the external generation path until the latency strategy is decided. Options include a faster Workers AI model, a shorter answer, or accepting a longer platform response time only after PlayMCP testing confirms it is tolerated.
- Timeout, non-success response, empty output, truncated completion, refusal, fewer than three Markdown sections, or output shorter than 700 characters triggers the deterministic fallback.
- PlayMCP in KC deployment must inject `CLOUDFLARE_API_TOKEN` as a secret. It must never be committed or embedded in the container image.

## Personal Data and Storage Assumptions

- PlayMCP in KC documentation does not confirm built-in persistent storage, DB, KV, volume, or secrets as a product feature.
- Do not assume local container filesystem persistence.
- The preliminary MVP must not store user birth profile data.
- The external model request excludes the direct input summary, raw birth date/time, birthplace label, coordinates, user identity, and full chart dump.
- It sends only the current question and deterministic fact cards selected for that question.
- Fact cards can still permit indirect inference of birth timing, so they are treated as potentially identifying rather than fully anonymous.
- The user's question is sent because a focused final answer requires it. Tool guidance should discourage names, contact details, or unrelated sensitive information in that field.
- The preliminary MVP should avoid OAuth, custom-header identity, external DB, and account-level personalization unless they become strictly required.
- Users provide birth information per request or per chat session.
- Tool responses should not echo sensitive input more than needed.
- If finalist/future personalization is added, use an external datastore and store only the minimum profile required:
  - Birth date.
  - Birth time or unknown-time flag.
  - Birthplace.
  - Gender only if needed by the selected calculation method.
  - Normalized chart/cache data.
- Future profile storage requires explicit user consent.
- Future profile storage must provide view, update, and delete/reset flows.

## Preliminary MVP Scope

- Keep the implementation simple enough for fast PlayMCP registration and review.
- Do not implement profile persistence.
- Do not implement OAuth unless a chosen external API requires it.
- Prefer a deterministic calculation core plus a replaceable, guarded final-answer generator.
- Prioritize passing PlayMCP information loading, temporary registration, AI chat testing, and review.
- Save richer retention features for the finals:
  - Saved birth profile.
  - Daily/weekly/monthly push-like reading flows.
  - Compatibility history.
  - Chart widgets.
  - Personalized reminders.

## Testing Surfaces

- Local development can test `/healthz` and `/mcp` with JSON-RPC requests.
- Preliminary platform testing should use PlayMCP temporary registration and PlayMCP AI Chat.
- Official PlayMCP `llms.txt` describes PlayMCP AI Chat as the website-internal test surface for tools in the user's toolbox.
- The contest page says temporary registration should be used for PlayMCP testing before review.
- The contest page also says finalist works are exposed to Kakao Tools users for public voting.
- Therefore, direct KakaoTalk/Kakao Tools testing should be treated as a finalist-stage path unless Kakao separately grants earlier access.

## PlayMCP Public Catalog Finding

PlayMCP exposes a public MCP list endpoint used by the web app:

```text
GET https://playmcp.kakao.com/api/v1/mcps?page=0&sortBy=FEATURED_LEVEL&pageSize=12
```

Observed on 2026-07-05:

- HTTP 200 without login.
- `totalElements`: `228`
- `totalPages`: `19`
- Items include `formattedTools`, descriptions, starter messages, usage counts, team profile, and auth summary.

Caveat:

- This endpoint is not documented in `llms.txt` as a stable public API.
- It should not be treated as a dependable product contract without Kakao confirmation.
- This is one reason the MCP discovery idea is not the main project.

## Sources Checked

- Contest page: `https://b.kakao.com/views/PlayMCP/AGENTIC_PlAYER_10`
- Official contest guide: `https://kko.to/player10`
- PlayMCP development guide: `https://kko.to/PlayMCPdevguide`
- PlayMCP homepage and `llms.txt`: `https://playmcp.kakao.com/llms.txt`
- PlayMCP web app bundle and observed public catalog API.
