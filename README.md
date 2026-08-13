# MigranShield

Mobile web application (PWA) that helps prospective, current, and returnee Indonesian
migrant workers break down the claims inside a recruitment offer, compare them with the
sources actually checked, and take a safer next step.

MigranShield does **not** decide whether an offer is safe or fraudulent. It shows which
claims are supported, contradicted, or still unverified, and what to verify next.

## Requirements

- Node.js 20.9 or newer (developed on Node 24)
- npm (a single `package-lock.json` is the source of truth)

## Getting started

```bash
npm install
npm run vendor:ocr   # copies the Tesseract runtime and downloads Indonesian/English language data
npm run dev          # http://localhost:3000
```

`npm run vendor:ocr` writes to `public/ocr/` and `public/tessdata/`, which are
git-ignored. Those assets are served from this origin so on-device OCR never contacts a
third-party CDN. If the download is unavailable, the application still works: OCR reports
an unavailable state and manual entry remains the documented fallback.

`npm run build` runs `vendor:ocr` first, so a clean checkout on a deployment host ships
with the OCR runtime present. Only `npm run dev` needs the manual step above.

## Scripts

| Command                                   | Purpose                                                      |
| ----------------------------------------- | ------------------------------------------------------------ |
| `npm run dev`                             | Development server                                           |
| `npm run build`                           | Vendors OCR assets, then production build (also type-checks) |
| `npm run start`                           | Serve the production build                                   |
| `npm run format:check` / `npm run format` | Prettier                                                     |
| `npm run lint`                            | ESLint (Next core-web-vitals + TypeScript)                   |
| `npm run typecheck`                       | `tsc --noEmit`                                               |
| `npm run test`                            | Vitest unit and integration tests                            |
| `npm run test:e2e`                        | Playwright end-to-end tests (builds and serves on port 3100) |
| `npx playwright install chromium`         | One-time browser download for `test:e2e`                     |
| `npm run vendor:ocr`                      | Vendor the OCR runtime and language data                     |

If the bundled Chromium download is unavailable, set `PLAYWRIGHT_CHANNEL=msedge` (or
`chrome`) to run the same end-to-end suite against a system-installed Chromium browser.

## Architecture

```text
src/
  app/                 routes (App Router), providers, global styles
  components/          accessible UI primitives and layout chrome
  features/            screen-level feature code (offer input, evidence, actions, result)
  domain/              framework-free claims, rules, evidence, sources, privacy, learning
  content/locales/     typed id/en message catalogs (id is the key contract)
  lib/                 small browser utilities
data/
  fixtures/            synthetic demo data, always `isDemo: true`
tests/
  unit/ integration/ e2e/
```

Domain modules never import React. Rules are deterministic pure functions that receive the
clock through their context, so results are reproducible. UI components render state and
collect input; they do not define risk or legal rules.

### Evidence model

Every check emits an `EvidenceItem` carrying claim, finding, status, reason, source name,
source tier, source URL, retrieval and check timestamps, comparison method, missing
information, limitation, next action, and rule/snapshot versions. Statuses are
`source_match`, `unverified`, `mismatch`, and `risk_indicator` — there is no score and no
safety verdict. The risk-indicator count is always `triggeredIndicators.length` computed
from the same array the screen renders.

### Data modes

`EvidenceDataMode` separates `demo`, `snapshot`, `live`, and `source_unavailable` at the
type level. A production data mode cannot read a demo dataset, a demo mode cannot read a
production snapshot, and a source failure never becomes a demo success.

This build ships **no approved production snapshot**. Real user input is therefore checked
against the deterministic rules only; the company and vacancy checks report
"cannot be checked yet" and link out to the official directory for manual verification.
The demo offer is the only path that reads the synthetic dataset, and every screen built
from it is labelled "Contoh hasil prototipe".

## Privacy and security defaults

- No account, no analytics, no session replay, no server-side OCR.
- The uploaded image never leaves the device; OCR runs in a Web Worker from local assets.
- Offer data lives in React memory for the active flow and is never persisted. A page
  reload clears it and the app explains that instead of restoring anything.
- Two values are persisted locally: the `uiLocale` enum (`id` or `en`) and a minimised
  progress record (practice scenario ids, check timestamps, indicator and evidence counts,
  rule and snapshot versions). No offer content, name, number, or amount is ever stored;
  the schema is an allowlist that cannot express them. History is capped at 20 checks,
  demo runs are excluded, and the user can delete it from the Kemajuan screen without
  losing the language choice. See `docs/decisions/0003-local-progress-and-history.md`.
- Phone numbers, account numbers, and personal names are masked in the view model before
  they reach a component, the accessibility tree, an export, or the clipboard.
- Sharing is generated from a dedicated allowlisted `RedactedShareSummary`.
- External links are restricted to reviewed HTTPS URLs on registry domains, open with
  `noopener noreferrer`, show their destination domain, and carry no query string.
- Security headers and a nonce-based CSP are applied in `next.config.mjs` and
  `middleware.ts`. The service worker caches only the public shell and excludes every
  offer-flow route.

Pages are rendered per request (`export const dynamic = 'force-dynamic'` in the root
layout) because a statically prerendered document cannot carry the per-request CSP nonce —
and under `script-src 'strict-dynamic'` a missing nonce silently blocks hydration, leaving
links working and buttons dead. An end-to-end test asserts that every served script tag
carries the nonce and that a button-only action still navigates.

## Limitations

- No official integration exists. Every source in `src/domain/sources/source-registry.ts`
  is a reviewed link-out with `authorizationStatus` recorded; none is authorized for
  reuse, snapshotting, or API access yet.
- The KP2MI/BP2MI digital complaint URL is an open owner decision, so that channel renders
  as unavailable with an approved official alternative rather than a guessed link.
- Contract and visa checks assess availability and completeness only. MigranShield cannot
  authenticate a document from an image.
- Fee rules are references to published regulation, not legal advice. They require human
  review before any production use.
