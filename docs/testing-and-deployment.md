# Testing and Deployment

Updated: 2026-07-05

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

Optional inputs:

- `birthplace`
- `timezone`
- `latitude`
- `longitude`

Behavior:

- Calculates Saju, Zi Wei Dou Shu, and Western natal chart data.
- Returns one Markdown context pack.
- Does not store birth information.
- Does not call external APIs during calculation.
- Leaves the final 상담/해석 to the host AI.

## License Note

This project uses `@orrery/core`, which is `AGPL-3.0-only`.

Operational implications:

- Keep this MCP source public under AGPL-compatible terms.
- Preserve upstream license notices.
- Clearly document modifications and attribution before submission.
