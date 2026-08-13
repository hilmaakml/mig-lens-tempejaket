# ADR 0003 — Persist minimised practice progress and check history locally

- Status: accepted, owner decision
- Date: 2026-08-13
- Supersedes: the "no persisted history" position in `SECURITY.md` sections 2, 3, and 6

## Context

The deployed prototype showed a new visitor a readiness score of `2/5`, pre-filled
practice progress, and two example history rows for offers the user had never checked.
Those numbers were hard-coded in `EXERCISES` and rendered unconditionally, so the screens
described activity that never happened — the opposite of the product's evidence-over-
assertion principle.

Fixing the display alone was not enough: practice answers were held in component state
only, so a correct answer changed nothing and every count reset on navigation.

`SECURITY.md` section 2 previously stated "Do not persist a real user history. MVP history
is synthetic or ephemeral", and section 6 allowed only the `uiLocale` enum in browser
storage. Making progress real therefore required an explicit owner decision.

## Decision

Practice progress and a minimised check history are persisted in `localStorage` under a
single key, `migranshield.progress`. There is no backend and no account.

What is stored, and nothing else:

- an opaque local id per history entry, never derived from offer content;
- the check timestamp;
- the triggered-indicator count;
- evidence counts grouped by status;
- locale-neutral rule ids and rule versions;
- the reference-data (snapshot) version, or `null`;
- the ids of practice scenarios answered safely.

What is never stored: the uploaded image, OCR text, raw form or offer content, company or
recruiter names, phone numbers, accounts, emails, identifiers, payment amounts or details,
contract and visa information. The Zod schema in `domain/progress/progress-state.ts` is an
allowlist that cannot express those fields, and tests assert that the serialised value
contains none of them.

Supporting rules:

- Demo runs are never recorded. Only a real check produces a history entry.
- History is capped at the 20 most recent checks.
- A history entry is deduplicated on `checkedAt`, so re-rendering, revisiting, or switching
  language cannot duplicate a check.
- Repeating a scenario cannot increase progress: completion is a set of scenario ids.
- Denominators come from the scenario catalogue, not a constant.
- The store exposes the empty state as its server snapshot, so a prerendered page matches a
  first-time visitor and hydration cannot mismatch.
- Any storage failure — unavailable, blocked, over quota, corrupt JSON, unknown schema —
  degrades to the empty state and an in-memory session. The app never crashes on it.
- The user can delete progress and history from the Kemajuan screen. That action does not
  touch the language preference, which lives under its own key.

## Consequences

- `SECURITY.md` sections 2, 3, and 6 are updated: browser storage now holds two keys,
  `uiLocale` and `migranshield.progress`, and the second is defined by the allowlist above.
- The privacy posture for offer content is unchanged. Nothing derived from an offer's
  content is written to disk; only counts and versions are.
- A user testing on a shared device leaves counts behind. The delete action exists for
  this, and the history note on screen states what is stored and where.
- If a future change needs a new persisted field, it is a privacy decision requiring an
  update to this record and to the schema, not a routine refactor.
