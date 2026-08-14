# ADR 0004 — First-run onboarding gate and reusable Guide

- Status: accepted, owner decision
- Date: 2026-08-13
- Specification: `LANDING_PAGE.md` v1.0
- Extends: ADR 0003 (local progress and history)

## Context

`LANDING_PAGE.md` specifies a first-run onboarding page shown once per browser storage
profile, plus a reusable **Panduan / Guide** reachable from the application header
afterwards. Storing whether onboarding has been completed requires a third persisted
value.

Section 4 of that specification permits only two persisted values — `uiLocale` and the
onboarding flag — and states "no persistent real-user offer history". That contradicts
ADR 0003, which persists `miglens.progress`: practice progress plus a capped history of
check _metadata_ (counts, timestamps, rule and snapshot versions, never offer content).

The conflict was raised with the owner before any code was written.

## Decision

**Three keys may be persisted, and no more:**

| Key                               | Contents                                                     | Record      |
| --------------------------------- | ------------------------------------------------------------ | ----------- |
| `miglens.uiLocale`                | `id` or `en`                                                 | Existing    |
| `miglens.progress`                | Practice progress and minimised check metadata, capped at 20 | ADR 0003    |
| `miglens.onboarding.v1.completed` | The single value `true`                                      | This record |

The owner chose to keep the progress and history feature. `SECURITY.md` is updated to
describe three exceptions rather than two, so the documentation and the code agree.

The onboarding claim shown to users — "Isi tawaran tidak disimpan sebagai riwayat pengguna
nyata" / "Offer content is not stored as real-user history" — remains accurate: the stored
history holds counts and versions, never the content of an offer.

### Behaviour

- The entry route `/` resolves `checking → onboarding | application`. The store's server
  snapshot is `checking`, so the prerendered document and the hydration pass agree and
  neither destination can flash before the flag has been read.
- The flag is written only when the user activates **Mulai Periksa / Start Checking** or
  **Lewati / Skip**. Rendering, focusing, or scrolling the page never writes it.
- Entering the application uses history replacement, so Back does not reopen first run.
- The Guide lives at `/app/panduan`, inside the application shell. Because no provider
  above it unmounts, opening the Guide mid-flow preserves in-memory offer state, OCR
  output, and evidence results. Viewing or leaving the Guide never touches the flag.
- Storage failures never block entry. A failed read resolves to `onboarding`; a failed
  write still advances the in-memory state, and onboarding may reappear on a later launch.
- `start_url` is `/` so an installed PWA passes through the same decision point rather
  than bypassing it or pinning onboarding forever.

### Versioning

`v1` names this onboarding content and behaviour. Wording or styling changes must not
reshow onboarding to existing users. A future version that justifies reshowing requires a
separate decision and its own key; this one is never overwritten or reinterpreted.

## Consequences

- "Shown once" means once per browser storage profile and origin. Clearing site data, a
  private window, a different browser or device, or a changed domain all reset it. The
  product must not claim to remember onboarding permanently or across devices.
- The Guide and onboarding share one content model, so the two cannot drift apart.
- Adding a fourth persisted key would be a privacy decision requiring a new record.
