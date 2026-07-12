import { afterEach, describe, expect, it } from "vitest";
import { startHttpServer, type RunningHttpServer } from "./http.js";

let runningServer: RunningHttpServer | undefined;

afterEach(async () => {
  await runningServer?.close();
  runningServer = undefined;
});

describe("startHttpServer", () => {
  it("serves health checks", async () => {
    runningServer = await startHttpServer({ port: 0, host: "127.0.0.1" });

    const response = await fetch(`${runningServer.url}/healthz`);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ ok: true, service: "fortune-context-mcp" });
  });

  it("rejects untrusted origins on the MCP endpoint", async () => {
    runningServer = await startHttpServer({
      port: 0,
      host: "127.0.0.1",
      allowedOrigins: ["https://playmcp.kakao.com"],
    });

    const response = await callToolsList("https://attacker.example");
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body).toMatchObject({
      error: { message: "Origin not allowed." },
      id: null,
    });
  });

  it("accepts a configured origin on the MCP endpoint", async () => {
    runningServer = await startHttpServer({
      port: 0,
      host: "127.0.0.1",
      allowedOrigins: ["https://playmcp.kakao.com"],
    });

    const response = await callToolsList("https://playmcp.kakao.com");
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.result.tools).toHaveLength(1);
  });
});

function callToolsList(origin: string): Promise<Response> {
  if (!runningServer) {
    throw new Error("HTTP server is not running");
  }

  return fetch(`${runningServer.url}/mcp`, {
    method: "POST",
    headers: {
      accept: "application/json, text/event-stream",
      "content-type": "application/json",
      origin,
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/list",
      params: {},
    }),
  });
}
