# Preliminary submission readiness

Checked: 2026-07-12

## Verdict

The Cerebras-backed preliminary server is deployed, connected to the existing PlayMCP draft, and verified end to end. It produced complete grounded readings within the measured 3,000ms p99 boundary, while still exceeding PlayMCP's separate 100ms average target.

The contest submission closes on 2026-07-14. Review takes up to seven business days and averages one to two days, so the latency decision and replacement deployment are urgent.

## Requirement matrix

| Area | Status | Evidence |
| --- | --- | --- |
| Kakao Cloud deployment | Pass | `fortune-reading-mcp-v3`, ID `2867`, Active; only one server remains |
| Public Streamable HTTP endpoint | Pass | `https://fortune-reading-mcp-v3.playmcp-endpoint.kakaocloud.io/mcp` |
| Supported MCP protocol | Pass | PlayMCP information loading and official MCP Inspector CLI succeeded |
| Working Tool count | Pass | One Tool; review policy requires at least one |
| Tool metadata | Pass | `name`, `description`, `inputSchema`, and all five annotations present |
| Naming policy | Pass | Server and Tool names do not contain `kakao` |
| Text response format | Pass | Markdown `TextContent` |
| Response size | Pass | Deterministic fallback measured 6,078 bytes, below the 24k limit |
| Response latency | **Measured p99 passes; average risk remains** | Cerebras samples: 749ms average / 860ms max and 726ms average / 750ms max; deployed Saju call 1,012ms; below 3,000ms p99 but above the 100ms average target |
| Origin validation | Pass | Deployed implementation rejects untrusted browser origins with HTTP 403 |
| MCP Inspector | Pass | Both `tools/list` and `tools/call` succeeded against the deployed endpoint |
| Automated tests | Pass | 9 files, 35 tests |
| Preliminary capacity disclosure | Pass | Cerebras free plan is documented as judging/demo capacity only; paid operator capacity is required before public exposure |
| TypeScript build | Pass | `npm run build` |
| Linux AMD64 image | Pass | Docker image built successfully from a clean `npm ci` |
| Container smoke test | Pass | `/healthz` and `/mcp` responded from the built image |
| Dependency vulnerabilities | Pass | `npm audit --omit=dev`: 0 vulnerabilities |
| Repository visibility | Pass | Public GitHub repository, default branch `main` |
| License and data rights | Pass with note | AGPL-3.0-only; Orrery attribution and source link documented |
| Secret handling | Pass | Cerebras key exists only in the PlayMCP in KC secret field and local ignored `.env`; the superseded key was revoked |
| Secret history scan | Pass | No Cerebras key pattern found in tracked source or Git history |
| Personal data storage | Pass | Birth inputs are not persisted; raw inputs are not sent to Cerebras |
| Representative image | Pass | Static 600x600 PNG, appropriate to the service |
| PlayMCP temporary registration | Pass | Existing registration points to `v3`; information load, save, Tool call, and AI Chat tested |
| PlayMCP review request | Not started | Must be requested after final replacement endpoint is verified |
| Public visibility | Not available yet | Change from private to public after review approval |
| Contest form | Not submitted | Submit once using the public PlayMCP detail URL |

## Quality evidence

- The deterministic calculation matches the reference `sky.told.me` output for the fixed 1988-04-19 08:30 Seoul fixture.
- Cerebras receives only the current question and deterministic fact cards, not raw birth input or the API key.
- PlayMCP AI Chat passed the user's latest question through `question` and respected a Saju-only request.
- The deployed Cerebras path produced a four-section Korean answer without asking for birthplace again.
- In the final v3 test, the Kakao host delivered all four sections from the Tool response without adding another interpretation.

## Deployed generation path

The implementation contains two generation adapters, and the deployed server explicitly selects Cerebras:

- Cloudflare Gemma 4 is not suitable for the final path because complete readings varied from seconds to more than 30 seconds.
- Cerebras `gpt-oss-120b` uses the same verified facts and grounding checks with a 2,500ms deadline and 900-token completion budget.
- The final five-call Cerebras run achieved 5/5 complete readings at 749ms average and 860ms maximum.
- A three-scenario run achieved 3/3 complete readings across Saju, Zi Wei Dou Shu, and Western astrology at 726ms average and 750ms maximum.
- A provider error, timeout, weak structure, wrong day master, scope leak, or unsupported claim still switches to deterministic chart-specific guidance.

Cerebras is the selected preliminary deployment provider. It clears the measured 3,000ms p99 boundary but still does not meet the documented 100ms average target, so review risk remains. The free account also permits only five requests per minute.

### Preliminary capacity disclosure

The contest MVP intentionally uses the Cerebras free plan to avoid unnecessary infrastructure cost during preliminary judging. This is a deliberate prototype constraint, not a production-capacity claim:

- Free capacity is limited to five requests per minute and can return HTTP 429 during bursts.
- The limit is acceptable for reviewer-driven demos and controlled PlayMCP testing only.
- Before finalist public voting or general user exposure, the operator must upgrade to paid inference capacity and repeat load verification.
- The service absorbs inference configuration and cost; users are not required to create or purchase an external LLM account.

## Remaining submission sequence

1. Request PlayMCP review and monitor the Kakao account email for approval or a correction request.
2. Before finalist or public exposure, upgrade to paid inference capacity and repeat concurrency and rate-limit tests.
3. After approval, change visibility from `나에게만 공개` to `전체 공개`.
4. Submit the public PlayMCP detail URL through the contest form. The form can be submitted only once.

## Official sources

- [AGENTIC PLAYER 10](https://b.kakao.com/views/PlayMCP/AGENTIC_PlAYER_10)
- [PlayMCP server development guide](https://www.notion.so/MCP-2d89b97b4888808a9e1dc17a13e70187)
- [PlayMCP review policy](https://www.notion.so/MCP-21b9b97b48888024922ec3dfcacf97e5)
- [MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector)
- [Streamable HTTP security](https://modelcontextprotocol.io/specification/2025-03-26/basic/transports)
