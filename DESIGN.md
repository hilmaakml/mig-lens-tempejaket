# MigranShield Design Specification

> Status: Required UI implementation specification  
> Version: 1.1  
> Last updated: 11 August 2026  
> Product form: Mobile web application / PWA

## 1. Purpose and source of truth

This document defines how the MigranShield prototype must be translated into a responsive mobile web application.

Visual reference: `docs/reference/MigrantShield.html`. If it is not there, search the project root, parent directory, or upload folder and preserve a copy at that path.

The HTML is a visual and interaction reference, not production code. It contains prototype-only constructs such as `x-dc`, `sc-if`, `sc-for`, `{{ ... }}`, `DCLogic`, and `support.js`. Replace all of them with real React/Next.js components and state.

When content or product behavior differs, `PRD.md`, `SECURITY.md`, and `DATA_SOURCES.md` override the HTML. Do not use that rule as permission for an unrelated redesign.

## 2. Product surface

MigranShield is a mobile web app that:

- opens through a normal browser URL;
- is optimized for entry-level Android phones;
- may be installed as a PWA;
- does not require a native Android/iOS build;
- does not use a fixed 402 px canvas on a phone; and
- does not show a fake phone frame or fake operating-system status bar.
- provides a state-preserving Indonesian/English language switcher across the public flow.

### Mobile

- Fill the available viewport width and height.
- Support 360–430 px widths without horizontal overflow.
- Use `100dvh` or a safe fallback rather than a fixed 872 px height.
- Respect `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)`.
- Keep primary actions and bottom navigation reachable by touch.

### Desktop and tablet

- Use a neutral page background.
- Center the application column.
- Use a maximum content width of approximately 430 px.
- A subtle page shadow is allowed, but do not simulate device hardware.
- Do not display `MIGRANSHIELD · PROTOTIPE KLIK` as application content.

### Language control

- Place a compact `ID / EN` control in a consistent header position on every public screen; it must not compete with the primary action.
- Give the control a visible selected state and an accessible name such as `Pilih bahasa / Choose language`.
- Keep both choices reachable at 360 px without hiding the screen title, back action, or causing horizontal overflow.
- Switching language keeps the current route, entered/corrected values, result, expanded Evidence Map item where practical, and current scroll context.
- Update `document.documentElement.lang`, page title, metadata, dialogs, toasts, and live-region messages.
- Do not use national flags as the only language label. Language is not equivalent to nationality.

## 3. Visual identity

### Typography

- Primary: Plus Jakarta Sans.
- Technical metadata: IBM Plex Mono.
- Load with `next/font` or self-hosted assets; do not require a third-party runtime font request.
- Use a minimum 16 px text size for form controls where practical to avoid mobile browser zoom.
- Preserve the compact hierarchy of the HTML, but critical evidence and limitations must remain readable at 200% zoom.

### Core color tokens

| Token            | Value     | Use                                     |
| ---------------- | --------- | --------------------------------------- |
| `brand-dark`     | `#0A463E` | Hero, bottom navigation, strong actions |
| `brand-primary`  | `#0E7C6B` | Primary buttons, links, active states   |
| `brand-accent`   | `#8FE0CE` | Accent on dark surfaces                 |
| `text-primary`   | `#16211F` | Main text                               |
| `text-secondary` | `#5B6A66` | Supporting text                         |
| `surface-app`    | `#F5F6F4` | App background                          |
| `surface-card`   | `#FFFFFF` | Cards and form surfaces                 |
| `border-default` | `#E7EAE7` | Card and divider borders                |
| `risk-bg`        | `#FBEDE4` | Warning/risk background                 |
| `risk-text`      | `#B84A1E` | Warning/risk text                       |
| `risk-border`    | `#F0CDB4` | Warning/risk border                     |
| `match-bg`       | `#E7F4EE` | Source match background                 |
| `match-text`     | `#0A6E5C` | Source match text                       |
| `match-border`   | `#BFE3D4` | Source match border                     |
| `unknown-bg`     | `#EEF1EF` | Unverified/unavailable background       |
| `unknown-text`   | `#5B6A66` | Unverified/unavailable text             |
| `unknown-border` | `#DDE2DF` | Unverified/unavailable border           |

Use orange for risk/warning, red only for a serious mismatch or error, green for a match with a named source, and gray for unverified or unavailable information. Color is never the only status signal; pair it with text and an icon.

### Shape and elevation

- Cards: 14–18 px radius.
- Primary hero: approximately 24 px radius.
- Buttons: 11–14 px radius.
- Pills/status labels: 6–9 px radius or fully rounded where appropriate.
- Use light borders and restrained shadows. Avoid glossy effects, gradients unrelated to the reference, or excessive animation.

### Motion

- Preserve a short fade/up transition similar to the prototype (about 200–300 ms).
- Respect `prefers-reduced-motion`.
- Do not delay access to evidence with decorative animation.

## 4. Screen inventory

Implement these 12 reference screens as navigable application states or routes:

1. Beranda
2. Unggah Tawaran
3. Konfirmasi Informasi
4. Hasil Pemeriksaan
5. Kanal Resmi
6. Pesan Verifikasi
7. Bagikan Ringkasan
8. Latihan
9. Simulasi
10. Pembongkaran Pola
11. Skenario Komposit
12. Kemajuan/Riwayat

Bottom navigation remains:

- Beranda;
- Periksa;
- Latihan; and
- Riwayat.

Every button must lead to a working state, safe external destination, or clear disabled explanation. No dead ends.

All 12 screens, bottom-navigation labels, and all non-screen states must be available in Indonesian and English. The Indonesian names above are the canonical design inventory, not permission to leave English screens partially translated.

## 5. Main interaction flow

`Beranda → Periksa Tawaran → Upload/manual/demo → OCR lokal → Konfirmasi dan koreksi → Pemeriksaan → Hasil → Peta Bukti → Tindakan Aman → Pesan/Kanal Resmi → Latihan Personal`

Rules:

- Browser back and in-app back controls behave predictably.
- A refresh that loses ephemeral offer state shows a clear explanation and route back to input.
- The user can always use manual input when OCR or a source is unavailable.
- Data corrected on the confirmation screen must appear consistently downstream.
- The result page uses progressive disclosure rather than one unbroken wall of content.

## 6. Screen-specific requirements

### Beranda

- Keep `Periksa Tawaran` as the dominant action.
- Preserve the dark teal hero and card-based learning/summary sections.
- Explain that the app maps evidence and missing information; it does not guarantee safety.

### Unggah Tawaran

- Show the privacy warning before any file control.
- Offer Camera, File, Manual Input, and an explicitly labelled Demo.
- MVP formats are JPG, PNG, and WebP up to 10 MB. The HTML's PDF wording is outdated and must be corrected.
- Show OCR as assistance, not as a decision-maker.

### Konfirmasi Informasi

- Every extracted field has a persistent label and can be corrected.
- Make missing and low-confidence fields visible without treating OCR confidence as risk.
- The main action is `Lanjutkan pemeriksaan` after confirmation.

### Hasil Pemeriksaan

Use this visual/content hierarchy:

1. immediate recommendation;
2. computed indicator count;
3. concrete triggered indicators;
4. company/P3MI result;
5. contacting-channel result;
6. Payment Safety Check;
7. Evidence Map;
8. safe actions;
9. relevant exercise; and
10. limitation notice.

Company and contacting-channel cards must remain visually separate. Never let a green company card visually imply that the contact, vacancy, payment, contract, or visa is verified.

### Evidence Map

- Use accessible accordions/cards.
- Always show status text + icon.
- Expanded content includes claim, finding, reason, source, dates, missing information, limitation, and next action.
- Do not truncate the source, limitation, or next action.

### Actions, message, and sharing

- Preview content before copy/share.
- Announce copy success using a toast and accessible live region.
- Display the external domain before opening an official link.
- Share preview receives only a redacted view model, never raw application state.

### Learning and history

- Personal exercises map to unresolved evidence as defined in `PRD.md`.
- Progress uses explainable counts such as `2 dari 3 latihan`, not decorative immunity scores.
- MVP history contains synthetic demo entries or current in-memory state only; do not persist real offer history.

## 7. Components and states

Prefer reusable internal components for:

- app header and back action;
- bottom navigation;
- status badge;
- evidence card/accordion;
- risk indicator list;
- privacy notice;
- upload method selector;
- labelled form field;
- source metadata;
- official-link card;
- toast/live region;
- language switcher; and
- empty, loading, offline, stale, unavailable, and recoverable-error states.

Move repeated SVGs into typed internal icon components. Do not add an icon library only to reproduce icons already available in the reference.

## 8. Accessibility

Target WCAG 2.2 AA:

- semantic headings and landmarks;
- skip link;
- persistent visible form labels;
- 44 × 44 px touch targets where practical;
- keyboard navigation and visible focus;
- `aria-expanded` and `aria-controls` for accordions;
- live regions for OCR progress, validation summaries, and toast feedback;
- status meaning without color;
- no critical text hidden on zoom; and
- straightforward Indonesian and English without blame or panic;
- the correct page `lang` value after every switch;
- accessible names and announcements in the active language; and
- no raw translation keys or silent fallback to mixed-language product copy.

## 9. PWA behavior

- Provide a web app manifest, icons, theme color, and installable metadata.
- Cache only the public shell and approved static learning assets.
- Offline fallback must not display or reconstruct user offer data.
- Never cache upload, confirmation, result, or share-preview routes/responses containing user content.
- PWA installability must not weaken the privacy rules in `SECURITY.md`.

## 10. Visual acceptance checklist

- No prototype syntax or `support.js` remains.
- No fake phone/status bar appears in the app.
- 360, 390, and 430 px viewports have no horizontal overflow.
- Desktop centers an approximately 430 px app column.
- Bottom navigation and safe areas work on a real mobile viewport.
- All 12 screens and back paths are reachable.
- The UI closely preserves the reference hierarchy, colors, cards, icons, and copy.
- Status remains understandable in grayscale and without color.
- Loading, empty, error, stale, offline, and source-unavailable states are visible and recoverable.
- Demo screens show `Contoh hasil prototipe`.
- `ID / EN` remains visible and usable on every public screen at 360–430 px.
- Switching language preserves the current step, form state, result semantics, and expanded evidence state where practical.
- Both languages preserve the same hierarchy, warnings, limitations, and safe actions.
