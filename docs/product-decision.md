# Product Decision

Updated: 2026-07-05

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
3. MCP answers with structured interpretation and practical reflection.
4. Future finalist version can save the profile to remove repeated input.

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
   - Returns Saju / Four Pillars, Zi Wei Dou Shu, and Western natal chart results as Markdown text.
   - Includes a short instruction block for the host AI: use this context to answer the user's concern warmly, cautiously, and as reflective entertainment.
   - Does not store the user's profile.
   - Does not decide the final 상담/해석 inside the tool.

Rationale:

- MCP tools should provide reliable information; the host AI should decide how to apply it to the user's question.
- The reference service already proves that all three systems can be calculated quickly and copied together as AI-friendly text.
- A single high-quality tool has less user and model confusion than several overlapping reading-type tools.
- Reading type is unnecessary because the user's natural-language question already tells the host AI whether the concern is career, relationship, timing, compatibility, or general self-understanding.

## Open Questions

- Should we accept AGPL-3.0-only obligations and use `@orrery/core`, or implement a smaller independent calculation core?
- Should unknown birth time omit Zi Wei Dou Shu entirely, or return Saju + approximate natal chart with clear caveats?
- What exact input fields should be required: birth date, birth time, gender, birthplace, timezone, longitude/latitude?
- How long should the returned chart context be to balance completeness with PlayMCP response speed and chat readability?
- Which retention features should be saved for the finalist version?
