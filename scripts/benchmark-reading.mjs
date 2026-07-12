import { readFile } from "node:fs/promises";
import { performance } from "node:perf_hooks";
import { generateFortuneReading } from "../dist/domain/fortune-reading.js";
import { CloudflareWorkersAiReadingGenerator } from "../dist/llm/cloudflare-workers-ai.js";

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

const model = process.argv[2] ?? env.CLOUDFLARE_AI_MODEL;
const latencyBudgetMs = Number(process.argv[3] ?? 3_000);
const requestTimeoutMs = Number(process.argv[4] ?? 2_500);
const runCount = Number(process.argv[5] ?? 5);

if (!model || !env.CLOUDFLARE_ACCOUNT_ID || !env.CLOUDFLARE_API_TOKEN) {
  throw new Error("Model or Cloudflare credentials are missing");
}

const question =
  "사주팔자만 깊게 봐줘. 어려운 용어는 쉽게 풀어서 최대한 자세히 설명해줘.";
const birthInput = {
  year: 1988,
  month: 4,
  day: 19,
  hour: 8,
  minute: 30,
  gender: "M",
  birthplace: "서울",
};
const generator = new CloudflareWorkersAiReadingGenerator({
  accountId: env.CLOUDFLARE_ACCOUNT_ID,
  apiToken: env.CLOUDFLARE_API_TOKEN,
  model,
  timeoutMs: requestTimeoutMs,
});

const results = [];
const samples = {};
for (let run = 1; run <= runCount; run += 1) {
  const startedAt = performance.now();
  const response = await generateFortuneReading(
    { ...birthInput, question },
    { generator, currentDate: new Date("2026-07-12T12:00:00+09:00") },
  );
  const elapsedMs = Math.round(performance.now() - startedAt);
  const generated = response.includes("# 상담 결과");
  const mode = generated ? "generated" : "guided-fallback";
  const validRoute = generated
    ? /甲木|갑목/.test(response) && !/(자미두수|서양 점성술|출생차트)/.test(response)
    : response.includes("# 질문별 해석 규칙") && response.includes("# 검증된 사주 사실");

  results.push({
    run,
    elapsedMs,
    mode,
    length: response.length,
    passed: elapsedMs <= latencyBudgetMs && validRoute,
  });
  samples[mode] ??= response;
}

const summary = {
  model,
  timeoutMs: requestTimeoutMs,
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
