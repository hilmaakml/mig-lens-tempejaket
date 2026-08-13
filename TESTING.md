# MigranShield Testing and Completion Gates

> Status: Required before any completion claim  
> Version: 1.1  
> Last updated: 11 August 2026

## 1. Testing principles

- Test user-visible behavior, security boundaries, source semantics, and limitations.
- Use synthetic fixtures only in automated tests.
- Fix clocks and IDs for deterministic output.
- Never call live government services from ordinary CI.
- A skipped or unexecuted test is not a pass.
- Completion reports must distinguish `passed`, `failed`, `not run`, and `blocked`.

Use the scripts already defined by the repository. For a new project, provide scripts equivalent to:

```text
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
npm audit
```

Do not create commands solely to report green output without meaningful coverage.

## 2. Unit tests

Cover:

- input normalization and runtime validation;
- every deterministic rule: match, mismatch, missing, malformed, and source-unavailable;
- company and contact status separation;
- indicator count derived from the rendered triggered collection;
- canonical status mapping and prohibited copy;
- masking of phone, email, username, account, and short/malformed values;
- allowlisted share-summary redaction;
- personal-exercise mapping;
- source freshness and snapshot metadata;
- rule and snapshot versions in evidence output;
- data-mode separation;
- source failure never becoming demo success;
- exact Indonesian/English translation-key and interpolation-parameter parity;
- locale-aware date, number, and count formatting; and
- prohibited verdicts and safety-critical copy checks in both languages.

## 3. Component and integration tests

Cover:

- manual input through confirmation and results;
- valid and invalid upload behavior;
- OCR progress, cancellation, failure, retry, and manual fallback;
- user correction reaching every downstream evidence item;
- company found with contact unverified;
- payment-rule combinations;
- source unavailable, stale snapshot, and no-match as distinct UI states;
- Evidence Map accordion semantics and keyboard behavior;
- source, reason, dates, limitation, and next action rendered together;
- action links built from approved source records only;
- message copy and accessible toast;
- redacted share preview and clipboard content;
- refresh after ephemeral state loss;
- language switching on a stateful screen preserves the route, corrected claims, evidence statuses, indicator count, source/rule versions, expanded evidence state where practical, and demo/live mode;
- navigation, validation, loading, error, unavailable, toast, clipboard, share preview, and limitation copy use the active locale; and
- loading, empty, offline, and recoverable error states.

Prefer queries by accessible role, name, label, and visible text.

## 4. End-to-end tests

Required flows:

1. Demo: Beranda → input → confirmation → result → Evidence Map → action → personal exercise.
2. Manual entry without OCR.
3. Invalid upload followed by successful correction.
4. OCR failure followed by manual fallback.
5. Source outage distinct from record not found.
6. Back navigation and refresh handling without a dead end.
7. Complete manual-entry flow in English.
8. Switch `ID → EN → ID` during confirmation or results without losing state or rerunning OCR/rules.

Required assertions:

- 360, 390, and 430 px have no horizontal overflow;
- desktop centers the app column;
- keyboard-only completion is possible;
- bottom navigation and safe-area padding remain usable;
- no upload/OCR/offer content appears in network requests;
- no offer data appears in browser storage or service-worker caches;
- no sensitive data appears in console output or page errors;
- share preview and clipboard are redacted;
- every demo result is visibly labelled;
- no raw translation key or unintended mixed-language product copy appears; and
- `html[lang]`, page title, accessible names, and live-region messages match the selected locale.

## 5. Security tests

Test:

- extension/MIME/signature mismatch;
- oversized, corrupt, and excessive-dimension images;
- XSS payloads in OCR, user, and source fields;
- unsafe URL schemes, arbitrary URL fetch, and open-redirect attempts;
- object URL revocation and worker termination;
- Content Security Policy compatibility;
- security headers on an authorized deployed preview;
- source-domain allowlist;
- logging/telemetry property allowlist;
- service-worker cache exclusions;
- dependency audit; and
- secret scanning.

## 6. Accessibility and visual QA

Target WCAG 2.2 AA and verify:

- semantic landmarks and heading order;
- visible labels and associated errors;
- visible focus and logical tab order;
- 44 × 44 px touch targets where practical;
- accordions expose `aria-expanded`/`aria-controls`;
- async status and copy feedback use live regions;
- status meaning survives grayscale/color removal;
- 200% zoom does not hide critical content;
- reduced-motion preferences are respected; and
- the language control is labelled, focusable, visibly selected, and usable at 360 px;
- switching language updates `html[lang]` and preserves focus/context; and
- source, limitation, and next-action text is not truncated.

Compare all 12 screens against `docs/reference/MigrantShield.html`. Preserve visual identity while applying the mobile-web corrections in `DESIGN.md`.

## 7. Prototype user-test gate

Before moderated testing:

- the full clickable flow exists without dead ends;
- demo labels appear on every applicable screen;
- no invented official data appears;
- company and contact are separate;
- indicator count equals the displayed list;
- the share preview is redacted;
- participants see the limitation notice;
- all public screens and critical safety copy are reviewable in both Indonesian and English; and
- researchers explain that the prototype is not the sole basis for a real payment or departure decision.

Suggested initial moderated sample:

- 2–3 CPMI;
- 2–3 PMI; and
- 2–3 purna-PMI.

Use 10–15 synthetic, redacted, resolved, or permissioned cases representing a matchable offer, ambiguous case, real-company-name impersonation, missing contract/fee information, and urgency/payment pressure.

## 8. Closed MVP gate

- Client OCR and manual fallback work.
- The approved versioned source snapshot is present, or source-unavailable behavior is honestly shown.
- URLs, retrieval dates, limitations, and rule versions are correct.
- Critical automated tests pass.
- No raw upload/OCR content appears in network, storage, cache, logs, or sharing.
- Privacy notice and research consent are reviewed.
- Dependency, header, external-link, accessibility, and mobile checks pass.
- Indonesian/English catalog parity, full-flow coverage, and state-preserving language switching pass.

## 9. Definition of done

A change is done only when:

- the relevant acceptance criteria in `PRD.md` are met;
- visual behavior follows `DESIGN.md`;
- privacy and security boundaries in `SECURITY.md` are preserved;
- source/demo behavior follows `DATA_SOURCES.md`;
- types and runtime schemas agree;
- tests cover behavior and relevant edge cases;
- applicable checks and the production build pass; and
- documentation and completion reporting are accurate.

The MVP additionally requires:

- upload/manual input through action and learning without dead ends;
- editable OCR confirmation;
- separate company/contact evidence;
- transparent rule output and computed indicator count;
- full Evidence Map metadata;
- redacted sharing;
- local, non-persistent uploads/OCR;
- typed demo/source separation;
- responsive 360–430 px mobile behavior; and
- complete Indonesian/English UI with a persistent, accessible, state-preserving switcher; and
- no absolute fraud/safety verdict.

## 10. Completion report template

Report:

```text
Project location:
Files created/changed:
Implemented behavior:
Demo-only behavior:
Official snapshots/integrations used:
Unavailable/manual sources:
Privacy and security impact:
Format check:
Lint:
Type-check:
Unit/integration tests:
E2E tests:
Production build:
Dependency/secret audit:
Added dependencies and rationale:
Assumptions:
Remaining limitations:
Owner decisions still required:
```

Never say `all tests passed` unless every listed applicable check was actually run and passed.
