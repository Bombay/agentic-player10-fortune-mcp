# Preliminary submission readiness

Checked: 2026-07-12

## Verdict

The project is functionally complete and reproducible, but it is **not yet ready to request PlayMCP review** for two reasons:

1. The deployed server still uses the old 20-second Gemma path. The local hybrid replacement stays below 3 seconds in the measured sample but still exceeds the separate 100ms average target.
2. MCP `Origin` validation and the hybrid fallback have been fixed locally but are not yet deployed to PlayMCP in KC.

The contest submission closes on 2026-07-14. Review takes up to seven business days and averages one to two days, so the latency decision and replacement deployment are urgent.

## Requirement matrix

| Area | Status | Evidence |
| --- | --- | --- |
| Kakao Cloud deployment | Pass | `fortune-reading-mcp`, ID `2789`, Active |
| Public Streamable HTTP endpoint | Pass | `https://fortune-reading-mcp.playmcp-endpoint.kakaocloud.io/mcp` |
| Supported MCP protocol | Pass | PlayMCP information loading and official MCP Inspector CLI succeeded |
| Working Tool count | Pass | One Tool; review policy requires at least one |
| Tool metadata | Pass | `name`, `description`, `inputSchema`, and all five annotations present |
| Naming policy | Pass | Server and Tool names do not contain `kakao` |
| Text response format | Pass | Markdown `TextContent` |
| Response size | Pass | Deterministic fallback measured 6,078 bytes, below the 24k limit |
| Response latency | **Partial blocker** | Three hybrid 5-call samples: max 2,460-2,554ms, average 2,219-2,447ms; p99 boundary protected locally, 100ms average target not met |
| Origin validation | Pending deploy | Local implementation rejects untrusted browser origins with HTTP 403 |
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
| PlayMCP temporary registration | Pass | Existing registration updated in place and AI Chat tested |
| PlayMCP review request | Not started | Must be requested after final replacement endpoint is verified |
| Public visibility | Not available yet | Change from private to public after review approval |
| Contest form | Not submitted | Submit once using the public PlayMCP detail URL |

## Quality evidence

- The deterministic calculation matches the reference `sky.told.me` output for the fixed 1988-04-19 08:30 Seoul fixture.
- Gemma receives only the current question and deterministic fact cards, not raw birth input or the Cloudflare token.
- PlayMCP AI Chat passed the user's latest question through `question` and respected a Saju-only request.
- The Kakao host LLM still shortens some completed Tool answers. The Tool `Response` tab contains the authoritative generated answer.

## Remaining decisions

### Selected latency strategy

The local implementation now uses a bounded hybrid:

- Gemma 4 receives only verified fact cards and has a 2,500ms deadline.
- A timeout, provider error, refusal, truncation, weak structure, wrong day master, scope leak, or unsupported claim switches to deterministic chart-specific interpretation guidance.
- Guidance is generated from the current user's day master, ten gods, and relations; it no longer contains fixture-specific `甲木·偏財·自刑` rules.
- Three five-call local runs measured max 2,460-2,554ms and average 2,219-2,447ms, with one or two complete Gemma answers per run and guided fallbacks for the remainder.

Drop-in model replacement was rejected. Llama 3.2 3B was fast but changed the Four Pillars and produced an incomplete answer; Qwen3 returned no normal content in the initial run; Gemma 3 12B was unavailable to the account. The hybrid still does not meet the documented 100ms average target, so review risk remains and must be judged explicitly before submission.

## Submission sequence

1. Commit and push the security, hybrid response, benchmark, and documentation changes.
2. Delete the old `fortune-context-mcp-v3` rollback server to free one Kakao Cloud slot.
3. Build a replacement PlayMCP in KC server from the final Git commit.
4. Inject ordinary environment variables, `CLOUDFLARE_AI_TIMEOUT_MS=2500`, and `CLOUDFLARE_API_TOKEN` as a secret.
5. Verify `tools/list`, `tools/call`, response size, generated/fallback behavior, and latency with MCP Inspector.
6. Edit the existing temporary PlayMCP registration, load information, save, and test in AI Chat.
7. Decide whether the remaining 100ms-average policy risk is acceptable, then request PlayMCP review immediately.
8. Monitor the Kakao account email for approval or a correction request.
9. After approval, change visibility from `나에게만 공개` to `전체 공개`.
10. Submit the public PlayMCP detail URL through the contest form. The form can be submitted only once.

## Official sources

- [AGENTIC PLAYER 10](https://b.kakao.com/views/PlayMCP/AGENTIC_PlAYER_10)
- [PlayMCP server development guide](https://www.notion.so/MCP-2d89b97b4888808a9e1dc17a13e70187)
- [PlayMCP review policy](https://www.notion.so/MCP-21b9b97b48888024922ec3dfcacf97e5)
- [MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector)
- [Streamable HTTP security](https://modelcontextprotocol.io/specification/2025-03-26/basic/transports)
