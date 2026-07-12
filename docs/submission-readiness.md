# Preliminary submission readiness

Checked: 2026-07-12

## Verdict

The project is functionally complete and reproducible, but it is **not yet ready to request PlayMCP review** for two reasons:

1. The deployed Gemma path takes about 8.9 to 12.1 seconds, while the official development guide requires average 100ms and p99 3,000ms.
2. MCP `Origin` validation has been fixed locally but is not yet deployed to PlayMCP in KC.

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
| Response latency | **Blocker** | Inspector call about 8.9s; direct call about 12.1s; required p99 is 3s |
| Origin validation | Pending deploy | Local implementation rejects untrusted browser origins with HTTP 403 |
| MCP Inspector | Pass | Both `tools/list` and `tools/call` succeeded against the deployed endpoint |
| Automated tests | Pass | 7 files, 23 tests |
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

### Latency strategy

Choose one before the replacement deployment:

- **Quality first:** keep Gemma 4 and accept a clear review-policy risk from 9-12 second responses.
- **Compliance first:** remove the per-call external LLM and return deterministic facts in under 100ms, accepting weaker Kakao-host interpretation.
- **Balanced redesign:** enrich deterministic interpretation cards so Kakao can answer well without a per-call LLM. This requires another focused implementation and PlayMCP quality test.

Drop-in model replacement is not sufficient based on current measurements. GLM-4.7-Flash remained slow, and Llama 3.1 8B Fast was only slightly above 3 seconds while producing weaker and less careful interpretation.

## Submission sequence

1. Decide the latency strategy.
2. Commit and push the security fix and final documentation.
3. Delete the old `fortune-context-mcp-v3` rollback server to free one Kakao Cloud slot.
4. Build a replacement PlayMCP in KC server from the final Git commit.
5. Inject ordinary environment variables and `CLOUDFLARE_API_TOKEN` only if the selected strategy uses Workers AI.
6. Verify `tools/list`, `tools/call`, response size, and latency with MCP Inspector.
7. Edit the existing temporary PlayMCP registration, load information, save, and test in AI Chat.
8. Request PlayMCP review immediately.
9. Monitor the Kakao account email for approval or a correction request.
10. After approval, change visibility from `나에게만 공개` to `전체 공개`.
11. Submit the public PlayMCP detail URL through the contest form. The form can be submitted only once.

## Official sources

- [AGENTIC PLAYER 10](https://b.kakao.com/views/PlayMCP/AGENTIC_PlAYER_10)
- [PlayMCP server development guide](https://www.notion.so/MCP-2d89b97b4888808a9e1dc17a13e70187)
- [PlayMCP review policy](https://www.notion.so/MCP-21b9b97b48888024922ec3dfcacf97e5)
- [MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector)
- [Streamable HTTP security](https://modelcontextprotocol.io/specification/2025-03-26/basic/transports)
