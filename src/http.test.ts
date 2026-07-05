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
});
