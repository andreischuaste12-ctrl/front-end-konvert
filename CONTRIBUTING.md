# Contributing

Thank you for your interest in improving Front-end Konvert.

## Before you begin

1. Search for an existing issue related to your change.
2. Open a proposal before implementing broad changes to behavior or public contracts.
3. Do not include credentials, personal data, client content, or unreviewed screenshots.
4. Follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## Setup

Create a fork or a branch with a descriptive name. Use Node.js 20 or later when working on the design-by-reference tooling:

```bash
cd design-por-referencia-konvert
npm ci
npx playwright install chromium
```

## Change guidelines

- keep instructions clear and consistent with the surrounding documentation;
- preserve the separation between read-only auditing and implementation;
- document new arguments, formats, and limitations;
- use synthetic data in examples and tests;
- do not weaken TLS validation, checksums, or network safeguards;
- keep paths and commands compatible with the environment described by the skill;
- update examples whenever a public contract changes.

## Validation

Run the checks defined by the component you changed. For `design-por-referencia-konvert`, the expected commands are:

```bash
npm run check
npm test
```

If a check cannot be run, explain why and describe the impact in the pull request. Never describe a check as passing when it was not executed.

## Pull requests

Keep each pull request focused on one goal. Include:

- the problem being solved;
- the previous and new behavior;
- affected files or contracts;
- checks performed and their results;
- known risks, limitations, or follow-up work;
- screenshots only when they help review a visual change and have been checked for private information.

By contributing, you agree that your contribution will be distributed under the [MIT License](LICENSE).
