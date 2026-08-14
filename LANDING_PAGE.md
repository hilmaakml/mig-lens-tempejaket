# MigLens First-Run Onboarding and Reusable Guide

> Status: Specification for implementation  
> Version: 1.0  
> Last updated: 13 August 2026  
> Product: MigLens mobile web application / PWA  
> Product languages: Bahasa Indonesia (`id`, default) and English (`en`)

## 1. Purpose

This document defines the onboarding landing page that appears when a user opens MigLens for the first time, and the reusable Guide that remains accessible from the application header afterward.

The intended experience is:

1. On the first visit in a browser or installed PWA, the user sees the onboarding page before entering the application.
2. After the user selects the primary action or skips the onboarding, MigLens stores one non-sensitive completion flag locally.
3. On later visits in the same browser, storage profile, and origin, MigLens opens the existing application home directly.
4. The user can reopen the same guidance at any time through **Panduan / Guide** in the application header.

This feature must not change the offer-checking flow, rule engine, Evidence Map, official-source handling, exercise behavior, history behavior, or user-offer data policy.

## 2. Important limitation of “once only” behavior

MigLens has no user account in the MVP. Therefore, “shown once” technically means **shown once per browser storage profile and application origin**, not once for the user across every device.

The onboarding may appear again when:

- the user clears site data;
- the user uses a private/incognito window;
- the user changes browser or device;
- the deployed origin/domain changes; or
- the application is reinstalled without retaining site storage.

Do not claim that MigLens remembers onboarding permanently or across devices.

## 3. Product decision summary

| Item                        | Required decision                                                                    |
| --------------------------- | ------------------------------------------------------------------------------------ |
| First visit                 | Show the onboarding landing page before the application home                         |
| Later visits                | Open the existing application home directly                                          |
| Completion event            | Primary CTA or explicit **Lewati / Skip** action                                     |
| Persistent value            | One validated boolean-like onboarding flag only                                      |
| Navigation after completion | Replace onboarding in browser history, then enter the real application               |
| Revisit path                | **Panduan / Guide** control in the application header                                |
| Guide content               | Reuse the onboarding content source/components; do not maintain duplicate copy       |
| Guide exit                  | Return to the route from which the user opened the Guide                             |
| User data                   | Never store offer, upload, OCR, result, identifier, or exercise answer with the flag |
| PWA                         | Installed PWA must apply the same first-run decision                                 |

## 4. Relationship to existing project documents

Before implementation, read `CLAUDE.md` and the documents it requires for UI, routing, PWA, localization, storage, testing, and privacy changes.

This specification introduces one deliberate change to the current MVP storage policy. `SECURITY.md` and any matching wording in `CONVENTIONS.md`, `PRD.md`, or tests currently allow only `uiLocale` as a persisted preference. Update those documents so that they also allow exactly one non-sensitive onboarding-completion flag.

The approved exception must remain narrow. Reconciled with ADR 0003 and ADR 0004, exactly
three keys may be persisted:

- language preference: validated `id` or `en` value;
- onboarding preference: validated completed/not-completed state;
- minimised progress record: practice scenario ids plus check _metadata_ only — counts,
  timestamps, and locale-neutral rule/snapshot versions, capped at 20 entries and erasable
  by the user (ADR 0003, approved by the owner on 13 August 2026);
- no other new persistence;
- no offer content stored as user history;
- no screenshot, OCR text, phone number, account number, recruiter identity, confirmed claim, result, or exercise response in browser storage.

Do not implement the new flag while leaving the security documentation and storage tests contradictory.

## 5. Scope

### 5.1 In scope

- First-run onboarding gate.
- One original, scrollable, mobile-first onboarding landing page.
- Indonesian and English content with complete key parity.
- One non-sensitive local completion flag.
- A persistent **Panduan / Guide** entry point in the application header.
- A reusable Guide view based on the same content as onboarding.
- Safe browser-back, refresh, direct-navigation, and installed-PWA behavior.
- Automated tests and visual/accessibility verification for the new behavior.

### 5.2 Out of scope

- User accounts or cross-device synchronization.
- Persistent user-offer or real-history storage.
- Analytics, session replay, trackers, advertising, or behavioral profiling.
- Rebranding work beyond using the final product name `MigLens` in the new UI.
- Changes to the existing checker, OCR, rule engine, Evidence Map, exercises, official channels, or source registry.
- Copying the layout, text, assets, source code, illustrations, or distinctive visual elements of another product.

## 6. Routing and entry behavior

Claude Code must audit the existing routing structure before choosing exact file and route names. Preserve working routes and do not rebuild the application shell merely to add onboarding.

Use this conceptual route model:

| Route/state       | Purpose                                                        | Completion flag effect                                |
| ----------------- | -------------------------------------------------------------- | ----------------------------------------------------- |
| App entry/root    | Reads the first-run state and resolves the correct destination | Read only                                             |
| Onboarding mode   | First-run landing page                                         | Set only after **Mulai / Start** or **Lewati / Skip** |
| Existing app home | Current Beranda/Home experience                                | No change                                             |
| Guide mode        | Reopens the guidance from the header                           | Must not clear or rewrite the flag                    |

Requirements:

1. Keep all existing app routes working.
2. Do not place offer content in URLs or query parameters.
3. Do not create redirect loops between the entry route, onboarding, and app home.
4. Do not show bottom navigation on the first-run onboarding page.
5. The Guide may use the application shell, but it must not expose a dead end.
6. Completing onboarding must use history replacement so browser Back does not immediately reopen first-run onboarding.
7. Opening the Guide from an application screen must use normal navigation so Back returns to the previous screen when safe.
8. If the previous route cannot be recovered safely, the Guide’s explicit return action must go to the existing app home.
9. A direct link to privacy or another intentionally public informational page must not become trapped in an onboarding redirect.
10. Do not rename existing routes unless required; if a route must change, add a safe redirect and document it.

## 7. First-run state contract

### 7.1 Recommended storage key

Use one dedicated key:

```text
miglens.onboarding.v1.completed
```

Allowed value:

```text
true
```

Rules:

- Treat a missing, malformed, or unexpected value as incomplete.
- Do not store a timestamp, user identifier, device fingerprint, navigation history, or source route.
- Do not combine the flag with `uiLocale` or any offer/application state object.
- Access browser storage only on the client; do not reference `window` or `localStorage` during server rendering.
- Wrap reads and writes in safe error handling because storage may be unavailable.
- Do not log raw storage contents.
- Centralize the key and validation logic; do not repeat string literals across components.

### 7.2 State resolution

The initial application state must distinguish:

```text
checking → onboarding | application
```

- `checking`: the client is safely reading and validating the completion flag.
- `onboarding`: no valid completion flag exists.
- `application`: the valid completion flag is present.

While state is `checking`, show a minimal branded loading state or neutral application shell. Do not briefly render the app home and then flash to onboarding, or render onboarding and then flash to app home.

### 7.3 Completion behavior

The flag may be written only after the user intentionally activates:

- **Mulai Periksa / Start Checking**; or
- **Lewati / Skip**.

Do not mark onboarding complete merely because the page rendered, received focus, or was partially scrolled.

After the action:

1. Write and validate the completion flag when storage is available.
2. Update the in-memory state immediately.
3. Navigate with history replacement to the relevant existing app destination.
4. Preserve the active UI language.

If storage is unavailable, do not block access to the application. Complete the current-session transition in memory and explain only when a useful, non-alarming message is needed. The onboarding may appear again on a later launch because persistence was unavailable.

### 7.4 Versioning

Version `v1` represents this onboarding content and behavior. Do not automatically reshow onboarding to existing users merely because wording or styling changes.

If a future safety-critical change may justify showing a new onboarding version, create a separate product decision and migration plan. Do not overwrite or silently reinterpret the existing key.

## 8. Shared content architecture

Build the onboarding and Guide from one shared content model and shared presentational components.

The modes may differ only where the user context differs:

| Element         | First-run onboarding                   | Reopened Guide                                                      |
| --------------- | -------------------------------------- | ------------------------------------------------------------------- |
| Header action   | **Lewati / Skip**                      | Back or close action                                                |
| Primary CTA     | **Mulai Periksa / Start Checking**     | **Kembali ke Aplikasi / Return to App** or context-safe checker CTA |
| Completion flag | Written after explicit completion/skip | Never cleared; no write required                                    |
| Intro wording   | Welcomes and prepares a new user       | Brief reference-guide framing                                       |
| Content source  | Shared                                 | Shared                                                              |

Do not duplicate Indonesian/English paragraphs in separate onboarding and Guide components. Use centralized, typed translation catalogs and semantic keys.

## 9. Onboarding information architecture and copy

The onboarding is a concise product guide, not a long marketing website. Prefer one scrollable page with four clear sections and a final CTA. Keep the total reading load manageable for users with limited digital literacy.

### 9.1 Header

Required elements:

- MigLens logo and wordmark;
- compact, accessible `ID / EN` language control;
- **Lewati / Skip** action in onboarding mode.

The header must remain usable at 360 px without horizontal overflow.

### 9.2 Section 1 — Introduction

**Bahasa Indonesia**

- Eyebrow: `Pemeriksaan tawaran kerja berbasis bukti`
- Heading: `Lihat bukti di balik setiap tawaran.`
- Description: `MigLens membantu calon pekerja migran memeriksa informasi dalam tawaran kerja, menemukan ketidaksesuaian, dan menentukan langkah aman berikutnya.`
- Primary action: `Mulai Periksa`
- Secondary action: `Pelajari Cara Kerjanya`

**English**

- Eyebrow: `Evidence-based job offer checking`
- Heading: `See the evidence behind every offer.`
- Description: `MigLens helps prospective migrant workers examine job-offer information, identify inconsistencies, and decide on safer next steps.`
- Primary action: `Start Checking`
- Secondary action: `Learn How It Works`

Use an original visual assembled from MigLens interface elements, such as a simplified Evidence Map preview. Do not use unverified statistics or assets from another site.

### 9.3 Section 2 — What MigLens checks

**Bahasa Indonesia**

- Heading: `Satu tawaran terdiri dari banyak hal yang perlu dibuktikan.`
- Supporting text: `Perusahaan yang ditemukan belum otomatis membuktikan bahwa perekrut, lowongan, rekening, kontrak, atau visa juga resmi.`

**English**

- Heading: `One offer contains several claims that need evidence.`
- Supporting text: `Finding a company does not automatically prove that the recruiter, vacancy, payment account, contract, or visa is official.`

Show compact, scannable items for:

- company/P3MI;
- contact person and channel;
- vacancy and destination;
- fees and payment recipient;
- contract and visa availability; and
- time pressure.

Avoid blame, panic, or a promise that the product can authenticate an entire offer.

### 9.4 Section 3 — How it works

Show three visual steps.

1. **Masukkan tawaran / Add the offer**  
   Type the information manually or upload a supported screenshot.

2. **Tinjau informasinya / Review the information**  
   Correct OCR output before MigLens evaluates the confirmed information.

3. **Periksa bukti dan langkah berikutnya / Review the evidence and next actions**  
   Examine what matches, differs, remains unknown, or cannot yet be verified.

Localized supporting copy:

**Bahasa Indonesia:** `MigLens menampilkan Peta Bukti dan langkah verifikasi berikutnya—bukan label mutlak “aman” atau “penipuan”.`

**English:** `MigLens provides an Evidence Map and next verification steps—not an absolute “safe” or “fraud” verdict.`

### 9.5 Section 4 — Privacy and limitations

**Bahasa Indonesia**

- Heading: `Privasi sejak awal.`
- Points:
  - `Tidak perlu membuat akun.`
  - `Gambar dan hasil OCR diproses di perangkat pada alur bawaan.`
  - `Isi tawaran tidak disimpan sebagai riwayat pengguna nyata.`
  - `MigLens tidak mengirim laporan secara otomatis.`
  - `Hasil tetap perlu dikonfirmasi melalui kanal resmi yang relevan.`

**English**

- Heading: `Private by design.`
- Points:
  - `No account is required.`
  - `Images and OCR output are processed on the device in the default flow.`
  - `Offer content is not stored as real-user history.`
  - `MigLens does not submit reports automatically.`
  - `Findings still need confirmation through the relevant official channels.`

Only show claims that match the actual implementation. If the code differs, fix the implementation or revise the copy; do not publish a false privacy claim.

### 9.6 Final CTA

**Bahasa Indonesia**

- Heading: `Punya tawaran kerja? Periksa buktinya terlebih dahulu.`
- Button: `Mulai Periksa`
- Supporting note: `Jangan unggah KTP, paspor, nomor identitas, atau dokumen yang memuat data pribadi sensitif.`

**English**

- Heading: `Received a job offer? Check the evidence first.`
- Button: `Start Checking`
- Supporting note: `Do not upload an identity card, passport, identification number, or document containing sensitive personal data.`

The CTA must open the real existing offer-checking flow, not a placeholder.

## 10. Guide access from the application header

After onboarding has been completed or skipped, every appropriate top-level application screen must provide a consistent **Panduan / Guide** control in the header.

Requirements:

- Use a compact book/help icon with a visible text label when space allows.
- An icon-only mobile control must have an accessible name in the active language and a touch target of approximately 44 × 44 px where practical.
- Do not hide the `ID / EN` control, page title, or required back action at 360 px.
- The Guide opens the shared guidance in Guide mode.
- Opening the Guide must not clear form state, rerun OCR, rerun rules, or alter evidence results.
- If offer state is currently sensitive and in memory, prefer a non-destructive overlay only if the content remains accessible and usable; otherwise use a route that preserves in-memory application state. Audit the existing state architecture before choosing.
- Avoid a small modal for the full Guide on mobile; use a full-page view, drawer designed for long content, or route-based sheet with predictable focus and Back behavior.
- The Guide must have a clear **Kembali ke Aplikasi / Return to App** action.
- Viewing or closing the Guide must not change the onboarding flag.

## 11. UI and responsive behavior

- Mobile-first at 360–430 px.
- Maintain the established MigLens navy/teal palette, card language, typography, spacing, icons, and design tokens.
- Do not recreate the app design from scratch.
- Do not display bottom navigation on first-run onboarding.
- Do not create a fake phone frame or operating-system status bar.
- Use clear hierarchy, short paragraphs, scannable cards, and sufficient whitespace.
- Keep the primary CTA easy to find without making every section compete for attention.
- A sticky bottom CTA may be used on mobile only if it does not cover content, browser controls, keyboard content, or safe-area insets.
- Avoid heavy animation and large new dependencies.
- Respect `prefers-reduced-motion`.
- No horizontal overflow at 360, 390, or 430 px.
- Desktop should center the content in a readable-width container rather than stretching text across the viewport.

## 12. Accessibility

Target WCAG 2.2 AA.

Required behavior:

- semantic header, main, sections, and footer/closing region where applicable;
- one clear page-level heading;
- logical heading order;
- keyboard-reachable controls and visible focus states;
- a skip link when appropriate;
- active-language accessible names;
- minimum practical touch targets of 44 × 44 px;
- decorative icons hidden from assistive technology;
- informative graphics with meaningful alternatives;
- no status or meaning communicated by color alone;
- usable at 200% zoom;
- no auto-advancing carousel;
- no forced timer or delayed access to the application;
- focus moves predictably after route/mode changes; and
- language switching preserves the current onboarding/Guide section where practical.

## 13. Localization

- Indonesian is the first-visit default unless a validated existing `uiLocale` preference says otherwise.
- Store every new product-owned string in the centralized typed `id`/`en` catalogs.
- Require exact key and interpolation-parameter parity.
- Never display raw translation keys or mixed-language fallback copy.
- Update `html[lang]`, title, metadata, accessible names, and live-region messages with the selected language.
- Switching language must not mark onboarding complete, reset its scroll position unnecessarily, or alter application/offer state.
- Do not translate official names, user input, OCR text, source records, or official URLs.

## 14. Privacy and security requirements

The onboarding page and Guide must not:

- request or collect personal data;
- read, render, copy, log, or transmit offer content;
- add analytics, trackers, heatmaps, replay tools, advertising, or fingerprinting;
- store navigation history or a user identity with the completion flag;
- include an API key in client code;
- load unnecessary third-party assets;
- cache sensitive application routes or user-derived content;
- claim AI-based fraud detection when the implemented flow uses local OCR and deterministic rules; or
- imply endorsement by UNESCO, KP2MI/BP2MI, or another institution without written authorization.

The static onboarding/Guide shell and approved public learning assets may be cached by the PWA. Offer input, OCR, confirmation, results, and share preview remain excluded from caches.

## 15. PWA behavior

- The installed PWA and ordinary browser URL must use the same first-run flag.
- Keep the existing valid manifest, icons, theme color, and display mode.
- `start_url` must enter through the onboarding decision point, not bypass it or hardcode the onboarding page forever.
- Do not create different completion flags for browser and installed modes on the same origin.
- Offline first launch may show onboarding if its static assets are available; entering sensitive flows must retain existing offline/error safeguards.
- A service-worker update must not clear browser preferences unless a separately approved migration requires it.
- Cache-version cleanup must not delete or fabricate user history.

## 16. Error and edge-case behavior

| Scenario                        | Required behavior                                                        |
| ------------------------------- | ------------------------------------------------------------------------ |
| Missing flag                    | Show first-run onboarding                                                |
| Valid `true` flag               | Open existing app home                                                   |
| Invalid flag value              | Treat as incomplete; do not crash                                        |
| Storage read fails              | Show onboarding; allow entry using current in-memory state               |
| Storage write fails             | Allow entry; onboarding may reappear on a future launch                  |
| User refreshes onboarding       | Remain on onboarding until completed/skipped                             |
| User completes and presses Back | Do not immediately return to first-run onboarding                        |
| User opens Guide mid-flow       | Preserve the active flow and return safely                               |
| User changes language           | Preserve mode, section/context, and completion state                     |
| Site data is cleared            | Onboarding appears again                                                 |
| Domain changes                  | Treat as a new origin; onboarding may appear again                       |
| Offline launch                  | Use available static shell without exposing or reconstructing offer data |

## 17. Testing requirements

Use the repository’s real scripts and report `passed`, `failed`, `not run`, or `blocked` accurately.

### 17.1 Unit tests

- Storage-key constant and value validation.
- Missing, valid, invalid, and inaccessible storage behavior.
- Completion is written only for explicit start/skip actions.
- Guide mode never clears the flag.
- Exact Indonesian/English key parity.
- No onboarding storage object accepts offer or identifier fields.

### 17.2 Component and integration tests

- First visit renders onboarding after the checking state resolves.
- Valid completion state renders/navigates to the existing app home without an onboarding flash.
- Primary CTA writes the flag and opens the real checker.
- Skip writes the flag and opens the existing app home.
- The Guide control appears in the intended application headers.
- Guide mode reuses the shared content and has a working return action.
- Opening and closing Guide does not reset current application state.
- Language switching preserves the onboarding/Guide mode and does not mark it complete.
- Bottom navigation is absent from first-run onboarding.
- Storage failure does not block entry.

### 17.3 End-to-end tests

1. Clear site data → launch root → onboarding appears.
2. Complete onboarding → real application opens.
3. Reload/close and reopen → application home opens directly.
4. Open **Panduan / Guide** from the header → guidance appears.
5. Return from Guide → previous application context remains usable.
6. Clear the completion key → onboarding appears again.
7. Complete the flow in Indonesian and English.
8. Verify browser Back, refresh, direct public informational links, and installed-PWA start behavior.
9. Verify 360, 390, and 430 px without horizontal overflow.
10. Verify keyboard-only operation, focus order, 200% zoom, and reduced motion.
11. Inspect browser storage: only the approved locale and onboarding preferences may be present; no offer/OCR/result data may appear.
12. Inspect service-worker caches and network requests: no offer/OCR/result content may appear because of this feature.

### 17.4 Required checks

Run the applicable existing commands for:

```text
format check
lint
TypeScript type-check
unit/component tests
end-to-end tests
production build
dependency audit
```

Do not claim success for checks that were not run.

## 18. Acceptance criteria

The feature is complete only when all of the following are true:

1. A user with no valid completion flag sees the onboarding before the existing app home.
2. The primary CTA and Skip are the only first-run actions that mark onboarding complete.
3. A returning user with a valid flag enters the application directly without visible UI flashing.
4. **Panduan / Guide** remains accessible from the application header after onboarding.
5. The Guide reuses the onboarding content source and does not introduce conflicting duplicate copy.
6. Guide access does not reset or expose active offer state.
7. Indonesian and English content are complete and semantically equivalent.
8. Browser Back, refresh, direct informational links, and PWA launch do not create loops or dead ends.
9. No real offer history or sensitive content is added to browser storage, caches, logs, analytics, URLs, or network requests.
10. `SECURITY.md`, related conventions, and storage tests explicitly allow the narrow onboarding flag before implementation is declared complete.
11. All applicable automated checks and the production build pass.
12. Visual and accessibility checks pass at the required mobile widths.

## 19. Implementation sequence for Claude Code

1. Audit current routes, app shell, header variants, navigation, i18n catalogs, PWA manifest/service worker, application state, storage utilities, and tests.
2. Report any conflict between this document and the current implementation before changing behavior.
3. Update the security/product documentation to permit the single non-sensitive onboarding flag.
4. Add centralized first-run preference constants, validation, and safe client-only access.
5. Build the shared onboarding/Guide content model and components using existing design tokens.
6. Add first-run gating without changing existing app routes or feature logic unnecessarily.
7. Add **Panduan / Guide** to the relevant application headers and preserve active state.
8. Add complete Indonesian/English strings and parity tests.
9. Verify manifest, service-worker, offline, Back, refresh, and installed-PWA behavior.
10. Run all applicable checks and fix regressions caused by this change.

## 20. Required completion report

After implementation, report:

- route structure before and after;
- files changed;
- exact storage key and permitted value;
- documentation/security policy updates;
- how first-run resolution avoids UI flashing;
- how onboarding completion and Skip behave;
- where **Panduan / Guide** appears;
- how Guide access preserves application state;
- PWA and service-worker behavior;
- Indonesian/English coverage;
- accessibility and viewport checks;
- result of every format, lint, type-check, test, build, and audit command;
- any check not run or blocked; and
- remaining limitations or owner decisions.

Do not commit, push, deploy, rename the repository, or modify the Vercel project unless the user explicitly authorizes that separate action.
