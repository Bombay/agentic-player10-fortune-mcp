import { startHttpServer } from "./http.js";

const port = Number.parseInt(process.env.PORT ?? "3000", 10);
const host = process.env.HOST ?? "0.0.0.0";

const server = await startHttpServer({ port, host });

console.log(`fortune-context-mcp listening at ${server.url}/mcp`);
