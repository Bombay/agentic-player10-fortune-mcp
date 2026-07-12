import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import type { AddressInfo } from "node:net";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpServer } from "./mcp/server.js";

export type StartHttpServerOptions = {
  port: number;
  host?: string;
  allowedOrigins?: readonly string[];
};

export type RunningHttpServer = {
  url: string;
  close: () => Promise<void>;
};

export async function startHttpServer(
  options: StartHttpServerOptions,
): Promise<RunningHttpServer> {
  const host = options.host ?? "0.0.0.0";
  const allowedOrigins = new Set(options.allowedOrigins ?? []);
  const server = createServer((req, res) =>
    handleRequest(req, res, allowedOrigins),
  );

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(options.port, host, () => {
      server.off("error", reject);
      resolve();
    });
  });

  const address = server.address();
  const port = typeof address === "object" && address ? address.port : options.port;
  const publicHost = host === "0.0.0.0" ? "127.0.0.1" : host;

  return {
    url: `http://${publicHost}:${port}`,
    close: () => closeServer(server),
  };
}

async function handleRequest(
  req: IncomingMessage,
  res: ServerResponse,
  allowedOrigins: ReadonlySet<string>,
): Promise<void> {
  const path = new URL(req.url ?? "/", "http://localhost").pathname;

  if (path === "/healthz") {
    sendJson(res, 200, {
      ok: true,
      service: "fortune-context-mcp",
    });
    return;
  }

  if (path !== "/mcp") {
    sendJson(res, 404, {
      ok: false,
      error: "not_found",
    });
    return;
  }

  const origin = req.headers.origin;
  if (origin && !allowedOrigins.has(origin)) {
    sendJson(res, 403, {
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Origin not allowed.",
      },
      id: null,
    });
    return;
  }

  if (req.method !== "POST") {
    sendJson(res, 405, {
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Method not allowed.",
      },
      id: null,
    });
    return;
  }

  const mcpServer = createMcpServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  try {
    await mcpServer.connect(transport);
    await transport.handleRequest(req, res);
  } catch (error) {
    console.error("Error handling MCP request:", error);
    if (!res.headersSent) {
      sendJson(res, 500, {
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: "Internal server error",
        },
        id: null,
      });
    }
  } finally {
    await transport.close();
    await mcpServer.close();
  }
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
  });
  res.end(JSON.stringify(body));
}

function closeServer(server: Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}
