# ADR 0001 — Ship without an approved production source snapshot

- Status: accepted for Phase 0–1
- Date: 2026-08-11
- Owner decision still required: yes (PRD section 19)

## Context

`DATA_SOURCES.md` requires that a source may not enter production until access is
authorized, schema validation and tests exist, refresh and failure behaviour are defined,
and user-facing limitations are reviewed. No such authorization exists for SISKOP2MI, the
sanctions list, or the vacancy list. `PRD.md` also forbids inventing records, licence
numbers, URLs, or real-time verification results.

At the same time, the product must still be testable end to end with real user input.

## Decision

1. The source registry holds the real canonical URLs but records every entry as
   `accessMode: 'link_out'` with `authorizationStatus: 'not_requested'`. No application
   code fetches any of them.
2. The only reference dataset in the repository is the synthetic fixture under
   `data/fixtures/`, marked `isDemo: true`, reachable only from the explicit demo action.
3. A non-demo check runs with `dataMode = { kind: 'source_unavailable' }` and no snapshot.
   The company and vacancy checks therefore report "belum dapat diperiksa" with a link to
   the official directory for manual verification — never "tidak ditemukan", and never a
   silent fall back to the demo dataset.
4. The deterministic payment, time-pressure, contract, and visa checks run normally for
   real input, because they read only what the user confirmed.

## Consequences

- Real users get honest, working rule-based evidence plus a manual verification path.
- The demo scenario exercises the source-match and contact-separation paths for usability
  testing, and is visibly labelled "Contoh hasil prototipe" on every screen.
- `runVerification` enforces the separation in types: a demo mode cannot read a production
  snapshot and a production mode cannot read a demo fixture. This is covered by tests in
  `tests/unit/run-verification.test.ts`.
- Before any snapshot is added, the owner must resolve authorization, refresh cadence,
  staleness thresholds, and review ownership.
