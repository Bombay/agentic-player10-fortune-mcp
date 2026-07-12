import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as z from "zod/v4";
import { generateFortuneReading } from "../domain/fortune-reading.js";
import { createCloudflareReadingGeneratorFromEnv } from "../llm/cloudflare-workers-ai.js";

export const fortuneInputSchema = {
  year: z.number().int().min(1900).max(2100).describe("Birth year in Gregorian calendar."),
  month: z.number().int().min(1).max(12).describe("Birth month, 1-12."),
  day: z.number().int().min(1).max(31).describe("Birth day, 1-31."),
  hour: z.number().int().min(0).max(23).describe("Birth hour, 0-23 local time."),
  minute: z.number().int().min(0).max(59).describe("Birth minute, 0-59."),
  gender: z.enum(["M", "F"]).describe("Gender used by the astrology calculation system."),
  birthplace: z
    .string()
    .min(1)
    .describe(
      "Required birthplace city or region label, such as 서울, 부산, 광주광역시, 도쿄. Ask the user for birthplace before calling this tool.",
    ),
  timezone: z.string().min(1).optional().describe("Optional IANA timezone label. Known cities are resolved automatically when possible."),
  latitude: z.number().min(-90).max(90).optional().describe("Optional birthplace latitude. Provide together with longitude for manual coordinates."),
  longitude: z.number().min(-180).max(180).optional().describe("Optional birthplace longitude. Provide together with latitude for manual coordinates."),
  question: z
    .string()
    .max(500)
    .optional()
    .describe(
      "The user's latest fortune or counseling question. Copy the user's request here so the service can produce a focused final reading. If omitted, it produces a general reading.",
    ),
};

export const toolDefinition = {
  name: "generate_fortune_context",
  title: "Generate Fortune Context",
  description:
    "Fortune Counsel(사주 점성술 상담) generates a complete Korean fortune reading from Saju/Four Pillars, Zi Wei Dou Shu, and Western natal chart calculations. Use it for fortune, personality, career, money, relationship, or timing questions. Birthplace is required; ask before calling. Copy the user's latest request into question. The returned 상담 결과 is already the final user-facing answer: deliver it fully without summarizing, shortening, or adding another interpretation.",
  inputSchema: fortuneInputSchema,
  annotations: {
    title: "Generate Fortune Context",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  },
} as const;

export function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "agentic-player10-fortune-context",
    version: "0.2.0",
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
      const text = await generateFortuneReading(input, {
        generator: createCloudflareReadingGeneratorFromEnv(),
      });

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
