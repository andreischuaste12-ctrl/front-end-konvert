# Front-end Konvert: AI Agent Skills for Frontend Audits and UX/UI Design

Open-source AI agent skills for frontend audits, UX/UI design, accessibility reviews, responsive interface implementation, and Playwright-based visual verification in Codex and Claude Code.

[![MIT License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node.js 20+](https://img.shields.io/badge/Node.js-20%2B-339933.svg)](https://nodejs.org/)
[![CI](https://github.com/andreischuaste12-ctrl/front-end-konvert/actions/workflows/ci.yml/badge.svg)](https://github.com/andreischuaste12-ctrl/front-end-konvert/actions/workflows/ci.yml)

## What's included

| Skill | Purpose | Primary output |
| --- | --- | --- |
| [`audit-frontend-designer-konvert`](audit-frontend-designer-konvert/) | Audit an existing interface without modifying the target project | Structured PDF, Markdown, and JSON reports |
| [`create-frontend-from-zero-konvert`](create-frontend-from-zero-konvert/) | Build a new interface from a product brief | Functional frontend with rendered verification |
| [`design-por-referencia-konvert`](design-por-referencia-konvert/) | Refine an interface or apply an approved visual direction | Implementation backed by before-and-after evidence |

The three skills form a complete workflow, but each one can also be used independently:

1. **Audit:** identify problems and opportunities using observable evidence.
2. **Create or refine:** implement the authorized scope.
3. **Verify:** check states, responsiveness, accessibility, and visual fidelity in a browser.

## Use cases

- run a read-only frontend UX/UI audit and produce client-ready reports;
- create a landing page, storefront, dashboard, or application interface from a product brief;
- implement approved audit findings without expanding the authorized scope;
- adapt an existing frontend from a screenshot, URL, or written visual direction;
- inspect responsive behavior, interface states, contrast, images, and computed styles;
- compare rendered interfaces with repeatable Playwright evidence.

## Principles

- draw conclusions from observable evidence;
- keep read-only auditing separate from implementation;
- make decisions traceable and acceptance criteria verifiable;
- protect privacy with synthetic data and Git-ignored artifacts;
- consider accessibility throughout the workflow;
- use visual references as guidance without copying third-party identity or content.

## Installation

Copy the skill directory you need into your agent's skills directory:

| Tool | Project-level path | User-level path |
| --- | --- | --- |
| Codex | `.agents/skills/<skill-name>/` | `~/.agents/skills/<skill-name>/` |
| Claude Code | `.claude/skills/<skill-name>/` | `~/.claude/skills/<skill-name>/` |

To use the browser tooling included with the design-by-reference skill:

```bash
cd design-por-referencia-konvert
npm ci
npx playwright install chromium
```

Refresh or restart the agent after installation so it can discover the skill.

## Language

The repository overview and community files are maintained in English. The operational skill instructions and knowledge base are maintained in Brazilian Portuguese for their current primary audience; command names, schemas, and machine-readable contracts remain language-independent.

## Responsible use

Only inspect projects, pages, and environments you are authorized to access. Prefer test environments whenever an action may create persistent effects. Never commit credentials, sessions, personal data, or unreviewed screenshots.

Audit artifacts should be written to `.audit/`, which is ignored by this repository. Read the selected skill's instructions before running browser scripts.

## Contributing

Read the [contribution guide](CONTRIBUTING.md) before submitting changes. This project also provides a [Code of Conduct](CODE_OF_CONDUCT.md), [Security Policy](SECURITY.md), and [Accessibility Statement](ACCESSIBILITY.md).

## License

Released under the [MIT License](LICENSE).

Copyright © 2026 Marcos Andrei Schuaste do Carmo.
