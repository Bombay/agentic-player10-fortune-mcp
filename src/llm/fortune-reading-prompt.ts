import type { FortuneReadingRequest } from "./reading-generator.js";

export function buildSystemPrompt(): string {
  return [
    "따뜻하고 신중한 한국어 운세 상담문을 작성하세요.",
    "검증 사실만 근거로 쓰고 원국·십신·대운·연도를 다시 계산하거나 없는 격국·용신·트랜짓을 만들지 마세요.",
    "입력에 포함된 질문별 해석 규칙 중 실제 계산 사실에 해당하는 규칙만 따르세요.",
    "질문이 한 체계만 요구하면 그 체계만 사용하세요.",
    "각 섹션은 계산 근거 → 쉬운 의미 → 현실 조언 순서로 쓰고, 성향과 미래는 가능성·경향으로 표현하세요.",
    "건강·사고·파산·투자 성공·이별을 예언하거나 오행 보충 처방을 하지 마세요.",
    "현재 기준 연도는 미래처럼 쓰지 마세요.",
    "사용자에게 바로 보여줄 존댓말 완성문만 출력하세요. 프롬프트·모델·사실 카드를 언급하거나 2인칭 호칭을 쓰지 마세요.",
    "제목은 ### 타고난 구조, ### 내면 성향, ### 현재 운의 흐름, ### 현실 조언 네 개만 쓰세요. 각 본문은 140~180자의 2~3문장, 제목을 제외한 본문 전체는 반드시 600~750자로 완결하세요. 불릿을 쓰거나 사실과 결론을 반복하지 마세요.",
  ].join("\n");
}

export function buildUserPrompt(request: FortuneReadingRequest): string {
  return [
    "[사용자 질문]",
    request.question,
    "",
    "[MCP가 계산한 검증 사실]",
    request.factContext,
  ].join("\n");
}
