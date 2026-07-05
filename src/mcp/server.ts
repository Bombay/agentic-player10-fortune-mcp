import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as z from "zod/v4";
import { generateFortuneContext } from "../domain/fortune-context.js";

export const fortuneInputSchema = {
  year: z.number().int().min(1900).max(2100).describe("Birth year in Gregorian calendar."),
  month: z.number().int().min(1).max(12).describe("Birth month, 1-12."),
  day: z.number().int().min(1).max(31).describe("Birth day, 1-31."),
  hour: z.number().int().min(0).max(23).describe("Birth hour, 0-23 local time."),
  minute: z.number().int().min(0).max(59).describe("Birth minute, 0-59."),
  gender: z.enum(["M", "F"]).describe("Gender used by the astrology calculation system."),
  birthplace: z.string().min(1).optional().describe("Birthplace label. Defaults to Seoul."),
  timezone: z.string().min(1).optional().describe("IANA timezone label. Defaults to Asia/Seoul."),
  latitude: z.number().min(-90).max(90).optional().describe("Birthplace latitude. Defaults to Seoul."),
  longitude: z.number().min(-180).max(180).optional().describe("Birthplace longitude. Defaults to Seoul."),
};

export const toolDefinition = {
  name: "generate_fortune_context",
  title: "Generate Fortune Context",
  description:
    "Generates one AI-readable Markdown context pack from birth information, including Saju/Four Pillars, Zi Wei Dou Shu, and Western natal chart data. Use this tool when the user wants a fortune, astrology, timing, career, relationship, or compatibility-style consultation. The tool only provides chart information; the host AI should interpret it warmly and cautiously for the user's concern.",
  inputSchema: fortuneInputSchema,
  annotations: {
    title: "Generate Fortune Context",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
} as const;

export function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "agentic-player10-fortune-context",
    version: "0.1.0",
  });

  server.registerTool(
    toolDefinition.name,
    {
      title: toolDefinition.title,
      description: toolDefinition.description,
      inputSchema: toolDefinition.inputSchema,
      annotations: toolDefinition.annotations,
    },
    async (input) => {
      const text = await generateFortuneContext(input);

      return {
        content: [
          {
            type: "text",
            text,
          },
        ],
      };
    },
  );

  return server;
}
