# Product Decision

Updated: 2026-07-12

## Decision

Build the fortune / astrology counseling MCP as the main Agentic Player 10 submission.

The MCP discovery idea is not selected as the main project.

## Selected Product

The product answers a user's personal concerns through a combined reading of:

- Saju / Four Pillars.
- Zi Wei Dou Shu.
- Western astrology birth chart.

For the preliminary MVP, the flow collects the minimum birth information needed for each reading and does not save it. The user can ask questions such as:

- "요즘 이직해도 될까?"
- "올해 연애운 어때?"
- "다음 달에 조심할 게 있을까?"
- "나랑 이 사람 궁합 봐줘."

## Why This Is the Main Bet

### Accessibility

The discovery MCP can recommend other MCPs, but if it cannot provide a direct install/apply UI inside the user's flow, its practical value is limited. Discovery is most useful when recommendation and installation are tightly connected.

### User Fit

KakaoTalk is a broad everyday app, not a developer-only surface. A saju counseling MCP is easier for non-technical users to understand immediately.

### Retention

Fortune counseling naturally supports repeat use:

- Daily/weekly/monthly readings.
- Career, relationship, money, family, and timing questions.
- Same input can be reused by the user in chat, but the server does not persist it in the preliminary MVP.
- Compatibility readings.
- Personalized follow-up based on saved profiles is reserved for finals or later versions.

Higher revisit potential can support Kakao's own app engagement and later monetization better than a purely utility-style catalog.

### Implementation Speed

The MVP can work with plain TextContent and Markdown.

It does not require:

- User profile storage.
- OAuth or custom user identity.
- External database setup.
- A stable PlayMCP catalog API.
- Auto-install capability.
- Complex cross-MCP orchestration.
- Widget support for preliminary submission.

### Demo Clarity

The demo is emotionally legible:

1. User enters birth information and a concern.
2. User asks a real-life concern.
3. MCP returns a complete structured interpretation with practical reflection.
4. Future finalist version can save the profile to remove repeated input.

### Answer Quality Decision

PlayMCP AI Chat tests showed that the host model summarizes raw chart data too aggressively. It produced acceptable delivery only when the tool response already contained a complete final draft.

The current architecture therefore keeps the calculation deterministic and uses Cerebras `gpt-oss-120b` as the deployed, replaceable final-answer generator. Cloudflare Workers AI remains an optional comparison adapter:

1. Calculate the three chart systems locally.
2. Convert structured results into deterministic, question-scoped fact cards.
3. Send only the fact cards and current question to the selected generator; do not send the full chart dump or direct birth-input summary.
4. Reject short, refused, malformed, or slow output.
5. Return the complete answer with an instruction for the host to deliver it verbatim.
6. Fall back to the deterministic context pack when the generator is unavailable.

Local validation showed that sending the full chart caused counting mistakes, unsupported interpretations, and overly long responses. Fact cards eliminated the observed pillar-count and current-period mistakes and let explicit requests such as "사주팔자만" exclude the other systems entirely.

This decision replaces the earlier assumption that the host AI should always perform the final interpretation.

## Why MCP Discovery Is Deferred

The discovery MCP is technically possible because PlayMCP's public web app exposes public MCP list data with tool metadata and usage counts.

However:

- The catalog endpoint is not documented as a stable public API.
- Recommendation without installation has weaker accessibility.
- Users who need MCP discovery may already be more technical than the broad KakaoTalk audience.
- The value depends heavily on Kakao Tools UX integration that may not be available to a third-party MCP.

It remains a possible second submission or future supporting tool, but not the main contest bet.

## Product Guardrails

- Position the service as reflective entertainment, not deterministic prediction.
- Avoid medical, legal, financial, or safety-critical claims.
- When answering sensitive concerns, provide grounded reflection and encourage user agency.
- Do not store profile data in the preliminary MVP.
- Do not require account identity in the preliminary MVP.
- If future storage is added, ask for explicit consent and provide deletion/reset.
- Make unknown birth time a supported path.
- Keep responses concise and readable in KakaoTalk-style chat.

## MVP Tool Shape

Use one tool first:

1. `generate_fortune_context`
   - Receives one-time birth information.
   - Receives the user's latest request in the optional `question` field.
   - Returns a complete Korean counseling answer when Workers AI is configured.
   - Instructs the host AI to deliver the complete answer without summarizing or adding interpretation.
   - Falls back to the original chart context when external generation is unavailable or fails quality checks.
   - Does not store the user's profile.

Rationale:

- Deterministic chart calculation and generative interpretation remain separate modules.
- The reference service already proves that all three systems can be calculated quickly and copied together as AI-friendly text.
- A single high-quality tool has less user and model confusion than several overlapping reading-type tools.
- Reading type is unnecessary because the user's natural-language question already tells the generator whether the concern is career, relationship, timing, compatibility, or general self-understanding.

## Open Questions

- Should we accept AGPL-3.0-only obligations and use `@orrery/core`, or implement a smaller independent calculation core?
- Should unknown birth time omit Zi Wei Dou Shu entirely, or return Saju + approximate natal chart with clear caveats?
- What exact input fields should be required: birth date, birth time, gender, birthplace, timezone, longitude/latitude?
- How long should the returned chart context be to balance completeness with PlayMCP response speed and chat readability?
- Which retention features should be saved for the finalist version?
