# Agentic Player 10 Saju MCP

## Context

- Contest: Kakao Agentic Player 10
- Target platform: PlayMCP / Kakao Tools
- Selected idea: fortune / astrology context MCP based on saju, zi wei dou shu, and western astrology.
- Current strategy: win preliminary review with a simple, no-storage, text-first MCP that fits KakaoTalk-style personal conversations.

## SSOT Documents

- [Contest and Platform SSOT](docs/contest-ssot.md): contest rules, PlayMCP constraints, deployment assumptions, and open questions.
- [Product Decision](docs/product-decision.md): why the project is now focused on the saju MCP instead of the MCP discovery MCP.
- [Feasibility Review](feasibility.md): implementation feasibility notes for both candidate ideas.
- [Testing and Deployment](docs/testing-and-deployment.md): local checks, Docker build, PlayMCP temporary registration, and KakaoTalk/Kakao Tools testing path.

## Confirmed Constraints

- PlayMCP in KC is required for preliminary submission.
- Deployment options are Git source build or container image.
- Remote MCP over Streamable HTTP is required.
- Stateless MCP is recommended.
- PlayMCP AI chat primarily expects TextContent responses.
- Preliminary MVP should not store user personal data.
- User personalization and saved profiles are reserved for finals or later versions.
- Recommended tool count is 3 to 10, with a hard cap at 20. The MVP intentionally starts with one high-value tool.

## Selected Idea

Build a personal counseling MCP that answers user concerns through:

- Saju / Four Pillars
- Zi Wei Dou Shu
- Western astrology birth chart

For the preliminary MVP, the product does not store the user's birth profile. The user provides birth information inside each tool call or conversation, and the server computes one AI-friendly context pack.

The MCP's job is to return Saju, Zi Wei Dou Shu, and Western natal chart facts. The host AI's job is to interpret those facts in response to the user's actual concern.

Saved profiles, reminders, and repeat-visit personalization are finalist or later-version features.

## Product Principle

This is not positioned as deterministic prediction. It should feel like reflective entertainment and structured self-counseling.

Strengths:

- Easy MVP.
- No auth, DB, or profile persistence required for preliminary review.
- Broad KakaoTalk audience fit.
- Text-only PlayMCP output is enough.
- Can expand into charts, monthly reports, compatibility, and widgets later.

Main risk:

- Birth data is sensitive, so the preliminary MVP avoids storage and keeps careful answer wording from the start.

## Current MVP

The implemented MCP exposes one tool:

```text
generate_fortune_context
```

It accepts one-time birth information and returns one Markdown context pack containing:

- AI 상담 지침
- Saju / Four Pillars
- Zi Wei Dou Shu
- Western natal chart
- No-storage processing note

## Local Commands

```bash
npm install
npm test
npm run build
HOST=127.0.0.1 PORT=3333 npm start
```

## License and Attribution

This project is licensed under AGPL-3.0-only.

The calculation core uses [`@orrery/core`](https://github.com/rath/orrery), also licensed under AGPL-3.0-only. Orrery provides the browser-first Saju, Zi Wei Dou Shu, and Western natal chart calculation logic that this MCP formats into an AI-readable context pack.
