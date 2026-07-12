import { readFile } from "node:fs/promises";
import { performance } from "node:perf_hooks";
import { setTimeout as delay } from "node:timers/promises";
import { generateFortuneReading } from "../dist/domain/fortune-reading.js";
import {
  CloudflareWorkersAiReadingGenerator,
  DEFAULT_WORKERS_AI_TIMEOUT_MS,
} from "../dist/llm/cloudflare-workers-ai.js";
import {
  CerebrasAiReadingGenerator,
  DEFAULT_CEREBRAS_TIMEOUT_MS,
} from "../dist/llm/cerebras-ai.js";

const envText = await readFile(new URL("../.env", import.meta.url), "utf8");
const env = Object.fromEntries(
  envText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const separator = line.indexOf("=");
      return [
        line.slice(0, separator).trim(),
        line.slice(separator + 1).trim().replace(/^["']|["']$/g, ""),
      ];
    }),
);

const provider = process.env.READING_PROVIDER ?? "cloudflare";
const model =
  process.argv[2] ??
  (provider === "cerebras"
    ? env.CEREBRAS_AI_MODEL ?? "gpt-oss-120b"
    : env.CLOUDFLARE_AI_MODEL);
const latencyBudgetMs = Number(process.argv[3] ?? 3_000);
const requestTimeoutMs = Number(
  process.argv[4] ??
    (provider === "cerebras"
      ? DEFAULT_CEREBRAS_TIMEOUT_MS
      : DEFAULT_WORKERS_AI_TIMEOUT_MS),
);
const runCount = Number(process.argv[5] ?? 5);
const delayMs = Number(process.argv[6] ?? 0);

if (!model) {
  throw new Error("Model is missing");
}

const scenarios = process.env.BENCHMARK_SCENARIOS === "1"
  ? [
      {
        name: "saju-career",
        question:
          "사주팔자만 깊게 봐줘. 어려운 용어는 쉽게 풀어서 최대한 자세히 설명해줘.",
        birthInput: {
          year: 1988,
          month: 4,
          day: 19,
          hour: 8,
          minute: 30,
          gender: "M",
          birthplace: "서울",
        },
      },
      {
        name: "ziwei-year",
        question: "자미두수만 사용해서 올해 직업 흐름을 자세히 봐줘.",
        birthInput: {
          year: 1995,
          month: 9,
          day: 3,
          hour: 14,
          minute: 20,
          gender: "F",
          birthplace: "부산",
        },
      },
      {
        name: "western-relationship",
        question: "서양 점성술 출생차트만 사용해서 관계 성향을 자세히 봐줘.",
        birthInput: {
          year: 1972,
          month: 12,
          day: 11,
          hour: 23,
          minute: 10,
          gender: "M",
          birthplace: "대구",
        },
      },
    ]
  : [
      {
        name: "saju-career",
        question:
          "사주팔자만 깊게 봐줘. 어려운 용어는 쉽게 풀어서 최대한 자세히 설명해줘.",
        birthInput: {
          year: 1988,
          month: 4,
          day: 19,
          hour: 8,
          minute: 30,
          gender: "M",
          birthplace: "서울",
        },
      },
    ];
const generator =
  provider === "cerebras"
    ? new CerebrasAiReadingGenerator({
        apiKey: env.CEREBRAS_API_KEY,
        model,
        timeoutMs: requestTimeoutMs,
      })
    : new CloudflareWorkersAiReadingGenerator({
        accountId: env.CLOUDFLARE_ACCOUNT_ID,
        apiToken: env.CLOUDFLARE_API_TOKEN,
        model,
        timeoutMs: requestTimeoutMs,
      });

if (
  (provider === "cerebras" && !env.CEREBRAS_API_KEY) ||
  (provider === "cloudflare" &&
    (!env.CLOUDFLARE_ACCOUNT_ID || !env.CLOUDFLARE_API_TOKEN))
) {
  throw new Error(`${provider} credentials are missing`);
}

const results = [];
const samples = {};
for (let run = 1; run <= runCount; run += 1) {
  if (run > 1 && delayMs > 0) await delay(delayMs);

  const scenario = scenarios[(run - 1) % scenarios.length];
  let rawReading;
  const recordingGenerator = {
    generate: async (request) => {
      rawReading = await generator.generate(request);
      return rawReading;
    },
  };
  const startedAt = performance.now();
  const response = await generateFortuneReading(
    { ...scenario.birthInput, question: scenario.question },
    {
      generator: recordingGenerator,
      currentDate: new Date("2026-07-12T12:00:00+09:00"),
    },
  );
  const elapsedMs = Math.round(performance.now() - startedAt);
  const generated = response.includes("# 상담 결과");
  const mode = generated ? "generated" : "guided-fallback";
  const validRoute = generated
    ? true
    : response.includes("# 질문별 해석 규칙") && response.includes("# 검증된 사주 사실");

  results.push({
    run,
    scenario: scenario.name,
    elapsedMs,
    mode,
    length: response.length,
    passed: elapsedMs <= latencyBudgetMs && validRoute,
  });
  samples[mode] ??= response;
  if (!generated && rawReading) samples["rejected-reading"] ??= rawReading;
}

const summary = {
  provider,
  model,
  timeoutMs: requestTimeoutMs,
  delayMs,
  maxMs: Math.max(...results.map((result) => result.elapsedMs)),
  averageMs: Math.round(
    results.reduce((sum, result) => sum + result.elapsedMs, 0) / results.length,
  ),
  generated: results.filter((result) => result.mode === "generated").length,
  fallback: results.filter((result) => result.mode === "guided-fallback").length,
  passed: results.every((result) => result.passed),
};

console.log(JSON.stringify(results, null, 2));
console.log(JSON.stringify(summary));
if (process.env.BENCHMARK_VERBOSE === "1") {
  console.log(JSON.stringify({ samples }, null, 2));
}
if (!summary.passed) process.exitCode = 1;
