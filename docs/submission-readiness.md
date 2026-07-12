# Preliminary submission readiness

Checked: 2026-07-12

## Verdict

The final hybrid server is deployed, connected to the existing PlayMCP draft, and verified end to end. It is technically ready to request PlayMCP review, with one explicit policy risk: measured calls stay below the 3,000ms p99 boundary but exceed the separate 100ms average target.

The contest submission closes on 2026-07-14. Review takes up to seven business days and averages one to two days, so the latency decision and replacement deployment are urgent.

## Requirement matrix

| Area | Status | Evidence |
| --- | --- | --- |
| Kakao Cloud deployment | Pass | `fortune-reading-mcp-v2`, ID `2844`, Active; only one server remains |
| Public Streamable HTTP endpoint | Pass | `https://fortune-reading-mcp-v2.playmcp-endpoint.kakaocloud.io/mcp` |
| Supported MCP protocol | Pass | PlayMCP information loading and official MCP Inspector CLI succeeded |
| Working Tool count | Pass | One Tool; review policy requires at least one |
| Tool metadata | Pass | `name`, `description`, `inputSchema`, and all five annotations present |
| Naming policy | Pass | Server and Tool names do not contain `kakao` |
| Text response format | Pass | Markdown `TextContent` |
| Response size | Pass | Deterministic fallback measured 6,078 bytes, below the 24k limit |
| Response latency | **Policy risk** | Three local samples: max 2,460-2,554ms; deployed sample 2,625ms; 100ms average target not met |
| Origin validation | Pass | Deployed implementation rejects untrusted browser origins with HTTP 403 |
| MCP Inspector | Pass | Both `tools/list` and `tools/call` succeeded against the deployed endpoint |
| Automated tests | Pass | 7 files, 25 tests |
| TypeScript build | Pass | `npm run build` |
| Linux AMD64 image | Pass | Docker image built successfully from a clean `npm ci` |
| Container smoke test | Pass | `/healthz` and `/mcp` responded from the built image |
| Dependency vulnerabilities | Pass | `npm audit --omit=dev`: 0 vulnerabilities |
| Repository visibility | Pass | Public GitHub repository, default branch `main` |
| License and data rights | Pass with note | AGPL-3.0-only; Orrery attribution and source link documented |
| Secret handling | Pass | Cloudflare token exists only in the PlayMCP in KC secret field and local ignored `.env` |
| Secret history scan | Pass | No Cloudflare token pattern found in Git history |
| Personal data storage | Pass | Birth inputs are not persisted; raw inputs are not sent to Workers AI |
| Representative image | Pass | Static 600x600 PNG, appropriate to the service |
| PlayMCP temporary registration | Pass | Existing registration points to `v2`; information load, save, Tool call, and AI Chat tested |
| PlayMCP review request | Not started | Must be requested after final replacement endpoint is verified |
| Public visibility | Not available yet | Change from private to public after review approval |
| Contest form | Not submitted | Submit once using the public PlayMCP detail URL |

## Quality evidence

- The deterministic calculation matches the reference `sky.told.me` output for the fixed 1988-04-19 08:30 Seoul fixture.
- Gemma receives only the current question and deterministic fact cards, not raw birth input or the Cloudflare token.
- PlayMCP AI Chat passed the user's latest question through `question` and respected a Saju-only request.
- The deployed guided fallback produced a four-section Korean answer without asking for birthplace again.
- The Kakao host LLM still shortens some completed Tool answers. The Tool `Response` tab contains the authoritative generated answer.

## Remaining decisions

### Selected latency strategy

The local implementation now uses a bounded hybrid:

- Gemma 4 receives only verified fact cards and has a 2,500ms deadline.
- A timeout, provider error, refusal, truncation, weak structure, wrong day master, scope leak, or unsupported claim switches to deterministic chart-specific interpretation guidance.
- Guidance is generated from the current user's day master, ten gods, and relations; it no longer contains fixture-specific `甲木·偏財·自刑` rules.
- Three five-call local runs measured max 2,460-2,554ms and average 2,219-2,447ms, with one or two complete Gemma answers per run and guided fallbacks for the remainder.

Drop-in model replacement was rejected. Llama 3.2 3B was fast but changed the Four Pillars and produced an incomplete answer; Qwen3 returned no normal content in the initial run; Gemma 3 12B was unavailable to the account. The hybrid still does not meet the documented 100ms average target, so review risk remains and must be judged explicitly before submission.

## Remaining submission sequence

1. Decide whether the remaining 100ms-average policy risk is acceptable, then request PlayMCP review immediately.
2. Monitor the Kakao account email for approval or a correction request.
3. After approval, change visibility from `나에게만 공개` to `전체 공개`.
4. Submit the public PlayMCP detail URL through the contest form. The form can be submitted only once.

## Official sources

- [AGENTIC PLAYER 10](https://b.kakao.com/views/PlayMCP/AGENTIC_PlAYER_10)
- [PlayMCP server development guide](https://www.notion.so/MCP-2d89b97b4888808a9e1dc17a13e70187)
- [PlayMCP review policy](https://www.notion.so/MCP-21b9b97b48888024922ec3dfcacf97e5)
- [MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector)
- [Streamable HTTP security](https://modelcontextprotocol.io/specification/2025-03-26/basic/transports)
