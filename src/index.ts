import { startHttpServer } from "./http.js";

const port = Number.parseInt(process.env.PORT ?? "3000", 10);
const host = process.env.HOST ?? "0.0.0.0";
const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "https://playmcp.kakao.com")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const server = await startHttpServer({ port, host, allowedOrigins });

console.log(`fortune-context-mcp listening at ${server.url}/mcp`);
