# MigLens

MigLens is a **mobile web application delivered as a Progressive Web App (PWA)**. It is not a native Android or iOS application.

## Required document map

Read only the documents relevant to the task, but do not skip a required policy:

| Task area                                                         | Required documents                                        |
| ----------------------------------------------------------------- | --------------------------------------------------------- |
| Product behavior or scope                                         | `PRD.md`                                                  |
| Any code change                                                   | `CONVENTIONS.md`                                          |
| UI, routes, responsive behavior, or visual QA                     | `DESIGN.md` and `docs/reference/MigrantShield.html`       |
| Language switcher, translated copy, locale formatting, or i18n    | `PRD.md`, `DESIGN.md`, `CONVENTIONS.md`, and `TESTING.md` |
| Upload, OCR, user input, storage, logging, sharing, or deployment | `SECURITY.md`                                             |
| Official records, snapshots, matching, or demo fixtures           | `DATA_SOURCES.md`                                         |
| New behavior, bug fix, or completion claim                        | `TESTING.md`                                              |

For an initial Phase 0–1 implementation, read all six Markdown documents completely before editing.

## Instruction priority

1. The user's current explicit request.
2. Safety, privacy, legal, and authorization constraints in `SECURITY.md`.
3. Product requirements and release scope in `PRD.md`.
4. Source governance in `DATA_SOURCES.md`.
5. Visual behavior in `DESIGN.md`.
6. Engineering rules in `CONVENTIONS.md` and test requirements in `TESTING.md`.
7. The reference HTML and existing repository patterns.

If documents materially conflict, stop and report the exact conflict. Do not resolve a privacy, security, legal, data-source, or product-scope conflict by guessing.

## Working rules

- First audit the current directory, project files, lockfile, scripts, tests, and uncommitted changes.
- If the current directory is not `hackathon-unesco`, use or create `./hackathon-unesco`. Never create `hackathon-unesco/hackathon-unesco`.
- Preserve a maintainable existing project. Do not overwrite or rewrite it without inspection.
- Convert the reference prototype into real React/Next.js components. Never ship `sc-if`, `sc-for`, `{{ }}`, `DCLogic`, `x-dc`, or `support.js`.
- Implement Phase 0 and Phase 1 first. Do not fabricate integrations, source records, licence numbers, or real-time verification.
- Keep uploads and OCR content on the user's device in the default flow.
- Do not commit, push, deploy, publish, or modify remote data unless explicitly requested.
- Before completion, run the applicable checks in `TESTING.md` and report facts, failures, demo status, unavailable sources, and remaining limitations.
