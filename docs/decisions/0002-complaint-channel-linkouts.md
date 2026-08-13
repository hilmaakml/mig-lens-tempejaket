# ADR 0002 — Complaint channels are link-outs with an explicit unavailable state

- Status: accepted for Phase 1
- Date: 2026-08-11
- Owner decision still required: yes (canonical KP2MI/BP2MI complaint URL)

## Context

`PRD.md` FR-12 requires that "Laporkan tawaran atau kontak mencurigakan" always opens a
working complaint-channel selection view, never a placeholder or dead end, while also
requiring that every complaint URL comes from the approved source registry and that no
offer content, identifier, or evidence result is transmitted.

The canonical KP2MI/BP2MI digital complaint URL is listed in PRD section 19 as an
unresolved owner decision.

## Decision

- `buildComplaintChannelViews` always returns all four channels, so the action can never be
  a dead end.
- Recommendations are derived from triggered evidence: an unresolved contact recommends
  AduanNomor, an unverified payment destination recommends CekRekening, and a placement
  context recommends the KP2MI/BP2MI channel. A recommendation states relevance only; it is
  never described as proof that fraud occurred.
- `kp2mi-complaint` carries `canonicalUrl: null`. Its card renders the
  "Kanal pengaduan digital belum tersedia" state plus the approved SISKOP2MI directory as
  the official alternative. No URL is guessed and no demo URL is substituted.
- Every rendered link is validated by `isAllowlistedUrl`: HTTPS only, registry domain only,
  no userinfo. Links open with `rel="noopener noreferrer external"` and display their
  destination domain.
- URLs are used verbatim from the registry. No query string, fragment, referrer payload, or
  clipboard action carries offer data.

## Consequences

- The unavailable state is a designed, tested state rather than a bug.
- Adding the reviewed complaint URL later is a one-line registry change plus a link
  validation test; no UI change is needed.
- Tests cover the recommendation mapping, the allowlist, the unavailable state with its
  alternative, and the absence of offer data in any external href.
