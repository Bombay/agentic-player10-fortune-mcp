# Testing and Deployment

Updated: 2026-07-12

## Local Verification

Install dependencies:

```bash
npm install
```

Run tests:

```bash
npm test
```

Build:

```bash
npm run build
```

Run locally:

```bash
HOST=127.0.0.1 PORT=3333 npm start
```

Health check:

```bash
curl -sS http://127.0.0.1:3333/healthz
```

Expected response:

```json
{"ok":true,"service":"fortune-context-mcp"}
```

MCP initialize check:

```bash
curl -sS -X POST http://127.0.0.1:3333/mcp \
  -H 'content-type: application/json' \
  -H 'accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"local-test","version":"0.0.0"}}}'
```

MCP tool call check:

```bash
curl -sS -X POST http://127.0.0.1:3333/mcp \
  -H 'content-type: application/json' \
  -H 'accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"generate_fortune_context","arguments":{"year":1993,"month":3,"day":12,"hour":9,"minute":45,"gender":"M","birthplace":"서울"}}}'
```

The tool response should be `TextContent` with Markdown sections:

- `AI 상담 지침`
- `사주팔자`
- `자미두수`
- `서양 점성술 출생차트`
- `처리 방식`

## Docker Build

Build for Kakao Cloud-compatible Linux AMD64:

```bash
docker build --platform linux/amd64 -t fortune-context-mcp:0.1.0 .
```

If Docker Desktop hangs while loading metadata for `node:22-bookworm-slim`, check whether the local Docker credential store is blocking Docker Hub manifest lookup. In this workspace the failing path was reproduced with the default `~/.docker/config.json` containing `credsStore: desktop`, while an empty Docker config worked:

```bash
mkdir -p /private/tmp/docker-empty-config
DOCKER_CONFIG=/private/tmp/docker-empty-config \
DOCKER_HOST=unix:///Users/siam/.docker/run/docker.sock \
docker build --platform linux/amd64 -t fortune-context-mcp:0.1.0 .
```

This keeps the application on Node 22 and only bypasses the local Docker Desktop credential helper during image resolution.

Run the image locally:

```bash
docker run --rm -p 3333:3000 fortune-context-mcp:0.1.0
```

## PlayMCP Preliminary Test Path

Officially supported preliminary testing path:

1. Deploy the MCP server in Kakao Cloud / PlayMCP in KC.
2. Use the public endpoint path `/mcp`.
3. Register the endpoint in the PlayMCP developer console.
4. Save it as temporary registration first.
5. Add the MCP to a PlayMCP toolbox.
6. Test through PlayMCP AI Chat.
7. Request review only after tool listing and tool call both work.

The contest page explicitly says temporary registration is used for PlayMCP testing before review.

## Redeployment Finding

Observed on 2026-07-05:

- Pushing a new commit to the Git repository does not automatically update the existing PlayMCP in KC deployment.
- The existing public endpoint still returned the old `tools/list` schema after commit `2ff191f` was pushed.
- The PlayMCP in KC detail page exposes lifecycle actions for start, stop, and delete. The "start" action calls `/api/v2/mcp/my-mcp-servers/{id}/start` and is an activation/restart action, not a Git source rebuild.
- The PlayMCP in KC Git source flow creates a new MCP server by posting to `/api/v2/mcp/builder/image-mcp-servers`.
- The PlayMCP developer console supports editing an existing registered MCP by patching `v1/mcps/{id}` and includes `endpointUrl` in the editable form state.

Recommended redeploy path for this project:

1. Keep the existing KakaoCloud MCP server running until the replacement is verified.
2. In PlayMCP in KC, create a new Git source build from the latest GitHub `main` branch.
3. Wait until the new MCP server status is active and copy the new public `/mcp` endpoint.
4. Verify the new endpoint with MCP `tools/list` and a sample `tools/call`.
5. In the PlayMCP developer console, edit the existing temporary registered MCP and replace `endpointUrl` with the new endpoint.
6. Click information loading/check in the console so PlayMCP refreshes tool metadata.
7. Save as temporary registration, apply it to AI Chat, and test.
8. Delete the old PlayMCP in KC server only after the PlayMCP console and AI Chat both use the new endpoint successfully.

Avoid deleting the old server before the replacement endpoint is confirmed, because delete changes the server state to `Deleted` and clears endpoint information in PlayMCP in KC.

Current redeployment state after the 2026-07-05 fix:

- Active replacement endpoint: `https://fortune-context-mcp-v3.playmcp-endpoint.kakaocloud.io/mcp`
- Replacement PlayMCP in KC server: `fortune-context-mcp-v3`, ID `1445`, status `Active`.
- Previous PlayMCP in KC server kept running for rollback: `fortune-context-mcp-v2`, ID `1443`.
- Old PlayMCP in KC server deleted to free the 2-server account limit: `fortune-context-mcp`, ID `1436`.
- Verification passed:
  - `tools/list` marks `birthplace` as required.
  - sample `tools/call` with `birthplace: "Seoul"` normalized to `서울`.
  - sample `tools/call` output includes `四柱八字`, `紫微斗數 命盤`, `Natal Chart`, and `Houses (Placidus)`.
  - PlayMCP developer console information loading succeeded and the temporary MCP registration was saved with the replacement endpoint.
  - PlayMCP AI Chat called `generate_fortune_context` and generated a career-change reading from an English-birthplace prompt.

Current hybrid deployment state observed on 2026-07-12:

- Git commit `132a711` was pushed to the public GitHub `main` branch.
- Active endpoint: `https://fortune-reading-mcp-v2.playmcp-endpoint.kakaocloud.io/mcp`
- PlayMCP in KC server: `fortune-reading-mcp-v2`, ID `2844`, status `Active`.
- Runtime configuration uses ordinary environment variables for `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_AI_MODEL`, and `CLOUDFLARE_AI_TIMEOUT_MS`.
- `CLOUDFLARE_API_TOKEN` is injected through the separate PlayMCP in KC secret field. Its value is not stored in Git, the container image, MCP prompts, responses, or logs.
- Previous servers were deleted after replacement verification; only `fortune-reading-mcp-v2` remains.
- Direct verification succeeded: initialize 123ms, `tools/list` 48ms, and a representative Saju-only `tools/call` 2,625ms.
- The existing temporary PlayMCP developer-console registration was edited in place, refreshed from the new endpoint, and saved. A second temporary MCP registration was not created.
- PlayMCP AI Chat passed the original question through the optional `question` argument, called `v2`, and produced a four-section grounded answer without asking for birthplace again.

## KakaoTalk / Kakao Tools Test Path

Current official text indicates:

- PlayMCP AI Chat is the immediate test surface for preliminary submissions.
- KakaoTalk 내 Kakao Tools exposure is part of the finalist/main-round flow.
- The contest FAQ says finalist works are publicly exposed through Kakao Tools for user voting and must support additional Kakao Tools requirements, including widget-related specs.

Conclusion:

- Before finalist selection, assume we cannot directly test this MCP inside KakaoTalk/Kakao Tools unless Kakao separately grants access.
- For now, test through local MCP checks and PlayMCP AI Chat.
- If selected for finals, add Kakao Tools-specific widget support and test in the Kakao Tools/KakaoTalk path Kakao provides.

## Tool Contract

Tool name:

```text
generate_fortune_context
```

Required inputs:

- `year`
- `month`
- `day`
- `hour`
- `minute`
- `gender`
- `birthplace`

Optional inputs:

- `timezone`
- `latitude`
- `longitude`
- `question`

Behavior:

- Calculates Saju, Zi Wei Dou Shu, and Western natal chart data locally.
- Converts the structured result into deterministic fact cards selected by the user's question.
- When Cloudflare credentials are configured, generates one complete Korean counseling answer with Workers AI Gemma.
- Sends the fact cards and current question, but excludes the full chart dump and direct birth-input summary from the external request.
- Falls back to chart-specific interpretation guidance plus verified facts on timeout, provider error, refusal, or weak or ungrounded output.
- Does not store birth information.

## Workers AI Configuration

Local `.env` keys:

```text
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_API_TOKEN=...
CLOUDFLARE_AI_MODEL=@cf/google/gemma-4-26b-a4b-it
CLOUDFLARE_AI_TIMEOUT_MS=60000
CLOUDFLARE_AI_MAX_TOKENS=600
```

Run `npm run benchmark:reading` to exercise both the generated-answer and guided-fallback paths. The benchmark still uses PlayMCP's 3,000ms p99 requirement as its default latency budget, while the Workers AI request now waits up to 60,000ms for answer quality. A generated answer can therefore be valid while the benchmark correctly reports a PlayMCP latency-policy failure.

PlayMCP AI Chat shows its built-in `TOOL call / loading` state while the tool is pending. The current public PlayMCP client does not expose custom MCP progress messages such as calculation and writing stages. Enabling Gemma thinking would add generation work without creating an earlier user-visible response, so thinking remains disabled.

### Cerebras candidate

The local benchmark supports a Cerebras-only generation path without changing the deployed MCP:

```text
CEREBRAS_API_KEY=...
CEREBRAS_AI_MODEL=gpt-oss-120b
CEREBRAS_AI_TIMEOUT_MS=2500
CEREBRAS_AI_MAX_TOKENS=900
```

```bash
npm run benchmark:reading:cerebras -- gpt-oss-120b 3000 2500 5 12500
BENCHMARK_SCENARIOS=1 npm run benchmark:reading:cerebras -- gpt-oss-120b 3000 2500 3 12500
```

Measured on 2026-07-12:

- Final Saju-only run: 5/5 grounded complete readings, 749ms average, 860ms maximum.
- Cross-domain run: 3/3 grounded complete readings across Saju, Zi Wei Dou Shu, and Western astrology, 726ms average, 750ms maximum.
- Unpaced burst testing reached HTTP 429 after the free account exceeded its displayed five-request-per-minute quota.
- Free account limits shown in the console: 5 requests/minute, 150/hour, 2,400/day; 30,000 tokens/minute and 1,000,000 tokens/hour/day.
- The candidate meets the measured 3,000ms p99 boundary but not the separate 100ms average target.

Operational disclosure for the contest build:

- The preliminary deployment intentionally uses the Cerebras free plan for judging, demos, and controlled testing.
- Five requests per minute is not production capacity; burst traffic can return HTTP 429.
- Upgrade the operator-owned account to paid inference capacity before finalist voting or general public exposure, then repeat concurrency testing.
- Do not ask PlayMCP users to supply an API key, create an external account, or pay for inference.

For PlayMCP in KC:

1. Add `CLOUDFLARE_ACCOUNT_ID` as an environment variable.
2. Add `CLOUDFLARE_API_TOKEN` as a secret.
3. Optionally add the model and timeout variables.
4. Never place the token in Git, `.env.example`, Docker build arguments, or image layers.
5. Verify both the final-answer path and the fallback path before replacing the current endpoint.

## License Note

This project uses `@orrery/core`, which is `AGPL-3.0-only`.

Operational implications:

- Keep this MCP source public under AGPL-compatible terms.
- Preserve upstream license notices.
- Clearly document modifications and attribution before submission.
