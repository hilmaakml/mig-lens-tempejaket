# MigLens Security and Privacy Specification

> Status: Mandatory; overrides convenience and visual fidelity  
> Version: 1.1  
> Last updated: 11 August 2026  
> Default architecture: local OCR and ephemeral in-memory offer data

## 1. Security objective

MigLens processes potentially sensitive recruitment information. The MVP must minimize collection, keep the uploaded image and OCR text on the user's device, prevent accidental persistence or disclosure, and avoid false assurance from incomplete evidence.

These requirements support privacy-by-design and should be reviewed against applicable Indonesian obligations, including UU No. 27 Tahun 2022 on Personal Data Protection, before public launch. This document is not legal advice.

## 2. Non-negotiable MVP invariants

- The core flow requires no user account.
- Raw images never leave the device in the default flow.
- OCR runs in the browser in a Web Worker.
- Offer data exists only in memory for the active flow.
- Do not store offer content in `localStorage`, `sessionStorage`, IndexedDB, cookies, a database, server cache, analytics, crash reports, or service-worker caches.
- Do not place offer data or identifiers in URLs, query parameters, route names, or filenames.
- Do not log raw uploads, OCR text, form values, share content, full identifiers, or user-entered search terms.
- Do not send uploads or OCR text to an LLM or third party.
- Do not enable analytics, session replay, heatmaps, DOM capture, or advertising scripts for the MVP.
- Do not persist offer content. Practice progress and a minimised check history may be stored locally under the allowlist in `docs/decisions/0003-local-progress-and-history.md`: counts, timestamps, locale-neutral rule and snapshot versions, and completed scenario ids only. Demo runs are never recorded.
- The application never guarantees that an offer is safe or fraudulent.

Any change to these invariants requires a separately reviewed product, privacy, security, and legal decision. A developer may not relax them to simplify implementation.

## 3. Data classification

| Class                   | Examples                                                                                        | MVP handling                                                                                                                   |
| ----------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Prohibited input        | KTP, passport, identity number, selfie/biometric, exact home address                            | Warn users not to submit; do not build fields for it                                                                           |
| Sensitive offer content | Screenshot, OCR text, phone, email, account, recruiter name, contract details                   | Memory only; never networked or persisted by default                                                                           |
| Confirmed claims        | User-corrected company, role, country, fee, deadline                                            | Memory only during the active flow                                                                                             |
| Redacted output         | Masked identifiers, evidence statuses, official URLs, next actions                              | May be previewed/copied only after redaction                                                                                   |
| Approved reference data | Reviewed source snapshots and metadata                                                          | Versioned, validated, separate from user data                                                                                  |
| Synthetic fixtures      | Fictional demo offers and records                                                               | Explicit `isDemo: true`; never used as live fallback                                                                           |
| UI language preference  | `uiLocale` with value `id` or `en` only                                                         | May be stored locally; must never be bundled with offer state or identifiers                                                   |
| Local progress metadata | Completed scenario ids, check timestamps, indicator and evidence counts, rule/snapshot versions | May be stored locally under `migranshield.progress`; schema-validated allowlist, capped at 20 checks, user-erasable (ADR 0003) |

## 4. Upload security

Accept one JPG, PNG, or WebP image up to 10 MB.

Validate all of the following:

- file size;
- extension;
- declared MIME type;
- file signature/magic bytes;
- successful image decoding; and
- bounded image dimensions and processing time.

Reject malformed, oversized, decompression-bomb-like, or unsupported input with a recoverable message in the active interface language. Cancelling or retrying must release the previous file.

Before selection, show:

> Jangan unggah KTP, paspor, nomor identitas, atau dokumen yang memuat data pribadi sensitif.

Never render a filename or OCR/source value as HTML. Do not use `dangerouslySetInnerHTML`.

## 5. Local OCR lifecycle

1. Create a short-lived object URL or in-memory image reference.
2. Start Tesseract.js in a dedicated Web Worker.
3. Show progress, cancel, retry, and manual-entry options.
4. Treat OCR output as untrusted and unconfirmed.
5. Do not evaluate rules until the user confirms/corrects the fields.
6. Revoke object URLs, clear image buffers/references, and terminate the worker after completion, cancellation, error, reset, or navigation away.

Do not print OCR content to the console. Error messages may include a safe error code but not the file contents, filename, personal values, or raw third-party error object.

## 6. Application state and browser storage

- Hold offer state in memory only.
- Exactly two keys may be persisted: the non-sensitive `uiLocale` enum (`id` or `en`) and the minimised progress record `migranshield.progress` (ADR 0003). Store each under its own dedicated key, validate both before use, and never serialize offer state beside them.
- The progress record is defined by a runtime allowlist schema. It has no field for an image, OCR text, raw offer content, company or recruiter name, phone, account, email, identifier, payment amount, contract, or visa, and adding one is a reviewed privacy decision.
- Storage failure, corruption, or an unknown schema must degrade to the empty state and an in-memory session, never to a crash.
- The user must be able to delete progress and history without losing the language preference.
- A refresh may clear the state. Explain this clearly and return the user to input.
- Do not silently restore sensitive state.
- Do not serialize the offer store for debugging tools in production.
- Do not include user content in React error boundaries or server-rendered error payloads.
- Use `Cache-Control: no-store` for any future response that could contain offer-derived information.

If persistence is proposed later, it requires documented purpose/lawful basis, notice/consent where required, data inventory, retention/deletion, encryption, least privilege, row-level security, audit logs, backup deletion, processor review, incident response, and data-subject request handling before implementation.

## 7. Masking, sharing, and clipboard

Generate sharing from a dedicated allowlisted `RedactedShareSummary`, never by copying the application state.

The summary must exclude:

- original image and OCR text;
- full phone, email, username, account/e-wallet number;
- national ID, passport, visa, document, or licence-like personal identifiers;
- full personal names;
- exact home address;
- file metadata;
- internal tokens, IDs, error data, or debug fields.

Mask in the view model before content reaches the component, accessibility tree, clipboard, HTML attributes, or analytics. Preview before copy/share and warn that the operating-system/browser share menu is outside MigLens's control.

## 8. Logs, telemetry, and research

MVP application telemetry is off by default.

If research events are later approved:

- use explicit opt-in consent;
- use participant codes, not names;
- use an allowlist of event names and properties;
- never capture free text, DOM, OCR, identifiers, filenames, screenshots, or offer-derived search terms;
- test payload schemas automatically; and
- document retention, access, withdrawal, and deletion.

Record interviews or usability sessions only with separate explicit consent. Prefer synthetic, old, redacted, or resolved cases. The prototype must not be the sole basis for a real payment or departure decision.

## 9. Network and external navigation

- Do not upload the image or OCR text.
- Do not fetch arbitrary user-provided URLs.
- Source requests may target only approved canonical domains from `DATA_SOURCES.md`.
- Validate all external responses with runtime schemas and bounded size/time.
- Show the destination domain before opening an external official link.
- Allow only HTTPS except local development.
- Use `rel="noopener noreferrer"` and a restrictive referrer policy where appropriate.
- Never build an official contact link from the unverified contact inside the offer.

## 10. Browser and deployment controls

Apply and test a policy appropriate to the final architecture:

- Content Security Policy;
- HSTS in production;
- `X-Content-Type-Options: nosniff`;
- restrictive `Referrer-Policy`;
- `Permissions-Policy` that denies unused capabilities;
- frame protections through CSP `frame-ancestors`;
- no client-bundle secrets; and
- `.env.example` containing names only, never real values.

If a service worker exists, cache only allowlisted static assets and public learning content. Exclude upload, OCR, confirmation, result, share preview, and any user-derived response. Delete obsolete cache versions on activation.

## 11. Threat model

| Threat                               | Required mitigation                                                                  |
| ------------------------------------ | ------------------------------------------------------------------------------------ |
| Accidental sensitive document upload | Pre-upload warning, narrow formats, manual alternative, no persistence               |
| Malicious/malformed image            | Signature/MIME/size/dimension validation, isolated worker, resource limits           |
| XSS through OCR or source text       | Framework escaping, render as text, no raw HTML                                      |
| SSRF/open redirect                   | No arbitrary fetching, source allowlist, safe URL parsing                            |
| Stale or poisoned reference data     | Reviewed source registry, hashes, timestamps, schema checks, stale UI                |
| Data leakage through logs/tools      | Allowlisted events, no bodies/state, tests of console/network/storage                |
| Secret exposure                      | Server-only environment use, ignored env files, secret scanning, rotation            |
| Demo mistaken for live verification  | Typed data modes, visible demo labels, no fallback from live failure                 |
| False reassurance                    | Company/contact separation, non-absolute status labels, limitations and next actions |
| Dependency compromise                | One lockfile, minimal dependencies, audit and review                                 |

## 12. Prohibited shortcuts

Never:

- claim an upload is deleted unless its lifecycle is implemented and tested;
- store data “temporarily” without a reviewed retention/deletion mechanism;
- add server OCR, Supabase, authentication, analytics, or an LLM merely because the technology is available;
- make a bucket public;
- expose a service-role/API secret to the browser;
- log full input to debug an error;
- cache sensitive routes in the PWA;
- hide a source outage behind demo data; or
- weaken a control to make a test or demo pass.

## 13. Security release gate

Before a closed user test:

- upload validation and cleanup tests pass;
- OCR and offer content produce no unexpected network request;
- browser storage and service-worker caches contain no offer data;
- console/errors contain no sensitive content;
- share preview and clipboard are redacted;
- external links use the approved registry;
- security headers are verified on the deployed preview, if deployment is authorized;
- dependency and secret scans pass; and
- remaining limitations are documented.

Before public beta, complete legal/privacy review, authorized source access, incident ownership, retention/deletion procedures, monitoring rules, accessibility review, and correction/support channels.
