# MigLens — Product Requirements Document

> Status: Draft for implementation  
> Version: 1.1  
> Last updated: 11 August 2026  
> Primary audience: product, design, engineering, research, and Claude Code  
> Product language: Bahasa Indonesia

> Document map: this file owns product scope and requirements. Use `DESIGN.md` for the mobile-web UI, `SECURITY.md` for privacy/security, `DATA_SOURCES.md` for source governance, `CONVENTIONS.md` for code rules, and `TESTING.md` for completion gates.

## 1. Purpose of this document

This document is the product source of truth for the first testable version of MigLens. It defines what the product must do, what it must not claim, how evidence is represented, how official sources are governed, and how user data is protected.

If an implementation detail conflicts with this document, stop and resolve the conflict before shipping. Legal interpretations and the current status of official sources must be reviewed by a qualified person before a public launch.

## 2. Product summary

MigLens is a mobile-first verification and Media and Information Literacy (MIL) tool for:

- prospective Indonesian migrant workers (CPMI);
- current Indonesian migrant workers (PMI); and
- returnee Indonesian migrant workers (purna-PMI).

Users can enter or upload information from a recruitment offer, correct the extracted information, compare its claims with available official references, review a transparent Evidence Map, and take a safer next action.

MigLens does **not** decide that an offer is safe or fraudulent. It helps users answer three narrower questions:

1. What claims are present in this offer?
2. Which claims are supported, contradicted, or still unverified using the sources currently checked?
3. What should the user verify next before paying, sending documents, signing, or departing?

## 3. Problem statement

Migrant-worker recruitment offers may combine a real company name with an unverified contact, incomplete contract, unclear fees, personal payment account, or pressure to act quickly. A user who only checks whether a company exists can receive false reassurance.

Existing official information is distributed across multiple channels. No single public database proves that a specific recruitment offer, person, phone number, bank account, contract, or visa is authentic. Users therefore need a claim-by-claim view of evidence and uncertainty rather than a single opaque risk score.

## 4. Product principles

1. **Evidence over verdicts.** Show the claim, source, finding, limitation, and next action. Never reduce the result to “safe” or “scam.”
2. **Company and contact are separate.** A registered P3MI does not prove that the person or account contacting the user represents it.
3. **Uncertainty is a valid result.** “Belum dapat diverifikasi” is preferable to an unsupported conclusion.
4. **User correction before evaluation.** OCR output is never treated as ground truth until the user has reviewed it.
5. **Transparent rules.** OCR/AI may structure text; deterministic and versioned rules produce evidence statuses.
6. **Privacy by default.** Collect and retain the minimum data necessary. Avoid accounts and server-side file storage for the MVP.
7. **Action after warning.** Every identified gap must lead to a concrete verification step.
8. **MIL as capability-building.** Exercises teach users to recognize patterns and request evidence; they do not promise “immunity.”
9. **Accessible under constraints.** The core flow must work on small screens, entry-level devices, and inconsistent connections.
10. **No fabricated officiality.** Demo data, cached data, and live official data must be visibly distinguishable.

## 5. Goals and success criteria

### 5.1 Product goals

- Help users distinguish a registered company from an unverified person or channel.
- Turn an uploaded offer into a structured, editable set of claims.
- Provide traceable evidence for P3MI, contact-channel, vacancy, payment, contract, visa, and time-pressure checks.
- Give users a safe action pack and a relevant personal MIL exercise.
- Produce a working PWA that can be usability-tested with CPMI, PMI, and purna-PMI.
- Establish a responsible data-source and privacy foundation for later official integrations.

### 5.2 MVP success metrics

Success metrics must be gathered with informed consent and without storing the content of the offer.

| Metric                      | MVP target | Measurement                                                                                      |
| --------------------------- | ---------: | ------------------------------------------------------------------------------------------------ |
| Core task completion        |     >= 80% | Participant reaches a next action without facilitator help                                       |
| Company/contact distinction |     >= 80% | Participant correctly explains that a registered company does not validate the contacting person |
| Evidence comprehension      |     >= 75% | Participant can state why at least one status was assigned                                       |
| Safe-action comprehension   |     >= 80% | Participant identifies “tunda dan verifikasi” when critical evidence is missing                  |
| OCR correction success      |     >= 90% | Participant can find and correct an intentionally wrong extracted field                          |
| Critical false reassurance  |    0 cases | Product never labels an ambiguous or risky case as safe                                          |
| Sensitive data in telemetry |   0 fields | Automated schema tests and log review                                                            |

Targets are research goals, not claims of product effectiveness.

## 6. Non-goals for the MVP

The MVP will not:

- guarantee that an offer is safe, legal, genuine, or fraudulent;
- issue legal decisions or replace KP2MI/BP2MI, law enforcement, immigration, embassies, or qualified advisers;
- authenticate a visa, contract, identity card, passport, signature, individual recruiter, or bank-account ownership;
- submit an automatic complaint to a government body;
- scrape or bypass controls on official sites without permission;
- train a proprietary fraud-detection model;
- create a general chatbot, forum, news portal, remittance feature, loan feature, or job marketplace;
- require an account to complete the core check;
- store raw screenshots or documents by default;
- calculate decorative “immunity” percentages or unexplained risk scores.

## 7. Target users and contexts

### 7.1 Primary user: CPMI reviewing an offer

- May receive an offer through WhatsApp, Facebook, Instagram, TikTok, or an intermediary.
- May have limited digital literacy and limited familiarity with official processes.
- Needs a clear next action, not technical terminology.
- May use an entry-level Android device and limited data connection.

### 7.2 Secondary user: PMI or purna-PMI supporting another person

- May use MigLens to help a family member or peer review an offer.
- Needs a shareable, privacy-safe summary.
- May contribute usability feedback, but does not become an official verifier.

### 7.3 Research/admin user

- Maintains approved source records and deterministic rules.
- Can see source freshness, import history, and test fixtures.
- Must not see raw user uploads or personal identifiers in analytics.
- Admin functions are out of the public navigation and require authenticated, least-privilege access when implemented.

## 8. Core user journey

**Beranda → Periksa Tawaran → Unggah/Isi Tawaran → Konfirmasi Informasi → Hasil Pemeriksaan → Peta Bukti → Tindakan Aman → Pesan Verifikasi/kanal resmi/pengaduan → Latihan Personal**

### 8.1 Happy-path test scenario

The deterministic prototype fixture must show:

- company/P3MI found in the approved test dataset;
- contacting person or number not verified as an official company channel;
- vacancy requiring confirmation;
- contract unavailable;
- written fee breakdown unavailable;
- payment requested to an unverified personal account;
- pressure to transfer on the same day; and
- final recommendation to delay payment and verify through official channels.

All fixture screens must display **“Contoh hasil prototipe”**. Fixture names, licence numbers, URLs, and identities must be clearly fictional or placeholders—not realistic official data.

## 9. Scope and functional requirements

### FR-01 — Home and entry points

The home screen must:

- keep the existing MigLens visual identity and primary navigation;
- make “Periksa Tawaran” the primary call to action;
- provide a secondary path to “Latihan”;
- briefly explain that the product checks evidence and missing information, not whether an offer is guaranteed safe;
- include a visible privacy reminder before upload.

Acceptance criteria:

- The primary action is reachable in one tap.
- The explanation does not use “aman,” “pasti penipuan,” “100% akurat,” or equivalent absolute wording.
- Navigation works at widths from 360 px to 430 px without horizontal overflow.

### FR-02 — Offer input and upload

The user must be able to:

- upload one JPG, PNG, or WebP image for OCR; or
- skip upload and enter the information manually.

PDF support is a later enhancement unless the existing project already supports it safely. Do not silently accept unsupported file formats.

Requirements:

- Maximum image size: 10 MB.
- Validate the file extension, MIME type, and file signature.
- Reject malformed, oversized, or unsupported files with a helpful message.
- Do not render extracted text as HTML.
- Remove image metadata in memory before any permitted server transfer or export.
- Show this warning before selection:

> Jangan unggah KTP, paspor, nomor identitas, atau dokumen yang memuat data pribadi sensitif.

- Do not claim a file is automatically deleted unless that behavior is implemented and tested.

Acceptance criteria:

- The core journey remains usable through manual entry when OCR fails or is unavailable.
- Cancelling the file picker does not break the flow.
- Retrying an invalid upload does not retain the previous file.

### FR-03 — Client-side OCR and extraction

OCR should run in the browser by default so the original image does not leave the device.

The extractor should propose, when present:

- company/P3MI name;
- recruiter/contact-person name;
- job position;
- destination country;
- offer channel;
- phone number, email, or username;
- payment amount;
- stated purpose of payment;
- payment recipient;
- account type: personal, company, or unknown;
- contract status;
- visa status; and
- payment/departure deadline.

Requirements:

- Display extraction progress and allow cancellation.
- OCR confidence may help prioritize fields for review but must not become a risk status.
- Never send OCR content to a general LLM without explicit product approval, a documented lawful basis, a reviewed data-processing agreement, and explicit user notice/consent where required.
- Treat all extracted text as untrusted input.

### FR-04 — Confirmation and correction

Before any evaluation, show “Konfirmasi Informasi.”

Required copy:

> Periksa kembali informasi berikut. Sistem dapat keliru membaca teks pada gambar.

Requirements:

- Every extracted field must be editable.
- Missing fields must be visibly labelled, not silently inferred.
- The user may return to the upload step.
- “Lanjutkan pemeriksaan” must use the corrected values.
- The original image should be released from application memory when no longer required.

Acceptance criteria:

- A corrected value appears in every downstream evidence item that depends on it.
- The app never evaluates an unconfirmed OCR result.

### FR-05 — P3MI/company check

The system compares the confirmed company name against the current approved reference snapshot.

Possible outcomes:

- **Ditemukan di sumber resmi**
- **Tidak ditemukan dalam cakupan sumber yang diperiksa**
- **Belum dapat diperiksa**

When found, display only available source fields:

- official name;
- licence/official identity, when present in the source;
- office address;
- official contact details;
- relevant administrative sanction information;
- source name and direct source URL;
- data retrieval date; and
- check date/time.

Rules:

- “Not found” must never be translated into “illegal” or “fraudulent.”
- A found company must not validate a contact person, vacancy, bank account, or document.
- If the source snapshot is stale or unavailable, say so.

### FR-06 — Contact-channel check

Display a separate card for the contacting person, phone number, email, or social account.

Possible outcomes:

- **Cocok dengan kontak yang tercantum pada sumber resmi**
- **Berbeda dari kontak yang tercantum pada sumber resmi**
- **Belum dapat diverifikasi**

Required explanation when appropriate:

> Perusahaannya ditemukan, tetapi identitas orang yang menghubungi Anda belum terbukti mewakili perusahaan tersebut.

Rules:

- Normalize phone numbers only for comparison; display them masked.
- A contact mismatch is evidence requiring confirmation, not proof of fraud.
- The next action must use a separately obtained official contact, never the number supplied in the offer.

### FR-07 — Vacancy check

Compare position, destination country, and P3MI against a current approved vacancy source when available.

Outcomes:

- **Sesuai dengan lowongan yang ditemukan**
- **Tidak sesuai dengan lowongan yang ditemukan**
- **Belum dapat diverifikasi**

Rules:

- A vacancy not found in search is not automatically fake.
- Show which fields were compared and the matching method.
- Show source retrieval/check timestamps.
- If only a partial match exists, use “Belum dapat diverifikasi” and explain the missing fields.

### FR-08 — Payment Safety Check

Display:

- amount;
- stated payment purpose;
- recipient name;
- account type;
- written fee breakdown availability;
- receipt/evidence availability;
- time pressure; and
- confirmation through an independently obtained official channel.

Initial deterministic risk indicators:

1. Contact sender has not been verified.
2. Payment is requested to an unverified personal account.
3. No written fee breakdown has been provided.
4. The user is pressured to transfer immediately or on the same day.
5. Payment recipient differs from the party named in the reviewed agreement.
6. Payment purpose or amount differs from the written agreement.

Only display an indicator when its rule is triggered by confirmed input. The displayed count must be computed from the displayed triggered list; it must never be hard-coded separately.

Primary recommendation when one or more high-risk payment indicators are present:

> Tunda pembayaran sampai identitas penghubung, rincian biaya, dan tujuan pembayaran dapat diverifikasi melalui kanal resmi.

Fee rules must be versioned and traceable to the applicable regulation or official guidance. Do not encode a blanket rule that PMI can never be charged any cost. Context may vary by destination, placement scheme, role, employer, and applicable regulation.

### FR-09 — Contract and visa completeness

For the MVP, these checks assess availability and completeness only.

Contract checks may identify whether the user has:

- a draft/written agreement;
- employer and worker identities;
- job, destination, wage, duration, and working-condition fields;
- fee components and payment parties, where applicable; and
- contact/signature fields.

Visa checks may identify whether:

- a document was provided;
- a visa type is stated; and
- the user has a relevant official destination-country channel to consult.

Required limitation:

> Dokumen telah tersedia, tetapi keasliannya belum dapat diverifikasi oleh MigLens. Konfirmasikan melalui kanal resmi.

Never label a document authentic based on OCR, formatting, logo, or an image alone.

### FR-10 — Evidence Map

The Evidence Map is the central product output. It must be a collection of cards or accordions, not a single score.

Minimum evidence categories:

- company/P3MI;
- contact identity and channel;
- vacancy;
- contract;
- visa;
- fees and payment; and
- time pressure.

Each evidence item must contain:

| Field                  | Requirement                                                              |
| ---------------------- | ------------------------------------------------------------------------ |
| `claim`                | Confirmed information from the offer/user                                |
| `finding`              | Relevant value found in the checked source or rule input                 |
| `status`               | One approved status value                                                |
| `reason`               | Plain-language explanation of why the status was assigned                |
| `sourceName`           | Human-readable source name, or “Informasi pengguna” for rule-only checks |
| `sourceUrl`            | Direct approved URL when an external source was checked                  |
| `sourceTier`           | Official primary, official guidance, user-provided, or community signal  |
| `retrievedAt`          | When the reference data was retrieved                                    |
| `checkedAt`            | When this comparison ran                                                 |
| `method`               | Exact/normalized/partial/manual/rule-based comparison                    |
| `missingInformation`   | Evidence still needed                                                    |
| `limitation`           | What this check cannot prove                                             |
| `nextAction`           | One concrete step                                                        |
| `ruleId`/`ruleVersion` | Present for deterministic rules                                          |

Approved internal statuses:

- `source_match` → “Sesuai dengan sumber”
- `unverified` → “Belum dapat diverifikasi”
- `mismatch` → “Tidak sesuai”
- `risk_indicator` → “Indikator risiko ditemukan”

Status meaning must remain understandable without color through text and iconography.

### FR-11 — Result hierarchy

Present results in this order:

1. recommended immediate action;
2. computed indicator count;
3. triggered indicators;
4. P3MI/company result;
5. contact-channel result;
6. Payment Safety Check;
7. Evidence Map;
8. Official Action Pack;
9. relevant personal exercise; and
10. product limitation notice.

Required limitation notice:

> MigLens membantu menguraikan klaim, membandingkan bukti, dan menunjukkan informasi yang masih perlu diverifikasi. Hasil ini bukan keputusan hukum atau jaminan bahwa suatu tawaran aman maupun penipuan.

Use progressive disclosure to avoid one excessively long page.

### FR-12 — Official Action Pack

Provide actions when relevant:

- “Lihat sumber resmi”
- “Hubungi melalui kontak resmi”
- “Buat pesan verifikasi”
- “Salin pesan”
- “Bagikan ringkasan”
- “Laporkan tawaran atau kontak mencurigakan”

Verification-message template:

> Mohon kirimkan tautan lowongan resmi, nama dan nomor izin P3MI, draf kontrak, rincian biaya tertulis, serta kontak kantor resmi yang dapat saya hubungi untuk melakukan verifikasi.

Requirements:

- Show a preview before copy/share.
- Copy action shows “Pesan disalin.”
- The complaint action must open a functional complaint-channel selection view; it must not be a decorative card, inactive `<div>`, placeholder link, or dead end.
- Complaint language must refer to the item that can actually be reported—such as an offer, contact, number, account, or suspected placement violation—not “melaporkan indikator.” An indicator is MigLens's analysis output, not the report object.
- Recommend complaint channels contextually from the confirmed input and triggered evidence, while still allowing the user to choose another applicable category:

  | User need or evidence                                                      | Primary official destination                         | Product behavior                                                                                                                                                                                                               |
  | -------------------------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
  | Suspicious phone number or contacting account                              | AduanNomor                                           | Explain that the service is for checking/reporting a number and that absence of a report does not prove the number is official                                                                                                 |
  | Suspicious bank or e-wallet account                                        | CekRekening                                          | Explain that the service is for checking/reporting an account and that absence of a report does not prove the account is safe or official                                                                                      |
  | Suspected recruitment/placement violation involving a P3MI or intermediary | Approved KP2MI/BP2MI complaint or service channel    | Open only a URL that has been reviewed and entered in the approved source registry; otherwise show that the digital complaint link is not yet available and provide an approved official service-directory/contact alternative |
  | PMI abroad who needs consular/procedural assistance                        | Peduli WNI or an approved Indonesian mission channel | Explain the destination and that authentication or additional information may be required on the official service                                                                                                              |

- Before opening an external complaint service, show:
  - the official service name and visible destination domain;
  - why the channel may be relevant;
  - examples of evidence the user may need to prepare, without automatically attaching or transmitting it;
  - the channel limitation; and
  - an explicit “Buka [nama layanan]” action.
- Complaint actions are safe external link-outs, not automatic reports. MigLens must not claim that a report has been submitted, accepted, investigated, or resolved.
- Do not prefill external forms or encode the offer, OCR text, phone number, account number, personal identifier, message, or evidence result in a URL, query string, fragment, referrer, clipboard action, or network request.
- Never attach the original screenshot, OCR output, or application state to an external service. The user independently decides what to submit after reading that service's privacy notice and requirements.
- Every complaint URL must come from the approved source registry. If its approval, availability, or canonical domain cannot be confirmed, show “Kanal pengaduan digital belum tersedia” and a safe official alternative; never substitute a demo or invented URL.
- External links must show the destination domain and open safely.
- The contact action must use a contact from an approved official source, not from the offer.

Acceptance criteria:

- Selecting “Laporkan tawaran atau kontak mencurigakan” always opens the complaint-channel selection view and never leads to a placeholder or dead end.
- A triggered suspicious-contact indicator recommends AduanNomor; a triggered suspicious-payment-recipient/account indicator recommends CekRekening; neither recommendation is described as proof that fraud occurred.
- The user can see why a channel is recommended, its destination domain, its limitations, and what evidence may be needed before leaving MigLens.
- Each enabled “Buka” action is a keyboard-accessible link with a valid allowlisted `href` and safe external-link attributes.
- A channel without an approved current URL is visibly unavailable and cannot be opened; an approved official alternative is offered.
- No click on a complaint action sends offer content or personal data from MigLens, and returning to the app does not display a false “laporan berhasil” state.
- The complaint-selection view remains usable through keyboard navigation, 200% zoom, and 360–430 px viewports.

### FR-13 — Privacy-safe sharing

The shared summary must never contain:

- original image/screenshot;
- full phone number, email address, username, or bank/e-wallet account;
- national ID, passport, visa, or other identity number;
- full personal name of the user;
- document metadata;
- exact home address; or
- free-text OCR content.

The summary may include:

- masked identifiers only when necessary;
- evidence categories and statuses;
- source names and official URLs;
- check date;
- missing information;
- limitations; and
- recommended next actions.

The user must review the redacted preview before sharing.

### FR-14 — Personal MIL exercise

Recommend one exercise based on the most relevant unresolved item:

| Trigger                     | Exercise                     |
| --------------------------- | ---------------------------- |
| Unverified contact          | Pencatutan Identitas Lembaga |
| Immediate-payment pressure  | Urgensi dan Tekanan Waktu    |
| Missing contract            | Meminta Bukti Tertulis       |
| Unverified personal account | Memeriksa Tujuan Pembayaran  |

Required explanation:

> Latihan ini direkomendasikan berdasarkan bagian yang masih perlu Anda verifikasi.

Progress must use explainable counts, for example:

> Sudah dikenali dalam 2 dari 3 latihan.

Do not use “Dikuasai,” “kebal,” “immunity,” or unsupported percentages.

### FR-15 — Source-unavailable and offline states

If a live source cannot be reached:

- do not reuse an old result as though it were live;
- display the last retrieval time if an approved snapshot is used;
- label the result “Berdasarkan data yang diperbarui pada [date]”;
- distinguish “source unavailable” from “not found”;
- provide a direct official link for manual checking; and
- allow the user to continue with rule-only checks.

The PWA may cache the public application shell and non-sensitive learning content. It must not cache uploads, OCR text, evidence results containing user inputs, or API responses containing sensitive information in the service worker.

### FR-16 — Research mode

Research telemetry is opt-in and off by default.

Allowed event properties:

- randomized study/session ID;
- screen/step name;
- success/failure enum;
- duration bucket;
- number of fields corrected;
- evidence category opened;
- action selected;
- device viewport category; and
- app/rule/source-data version.

Forbidden event properties:

- OCR text;
- uploaded file or filename;
- company/person names entered by the user;
- phone, email, social username, account number, address, country/job combination when it could identify a person;
- message content;
- IP address retained by the application; and
- full user agent where avoidable.

No session-replay or heatmap tooling may be enabled on the offer-check flow.

## 10. Data sources and evidence governance

### 10.1 Approved source classes

| Tier | Class                     | Use                                                                                                                |
| ---- | ------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| 1    | Primary official record   | Compare official names, licence/status, contacts, vacancies, sanctions, or legal requirements within stated limits |
| 2    | Official guidance/channel | Explain procedures and direct users to manual verification or complaint channels                                   |
| 3    | User-provided information | Define the claim being checked; never treated as independent proof                                                 |
| 4    | Community report/signal   | Risk signal only; absence of a report is never proof of legitimacy                                                 |

Only Tier 1 and Tier 2 sources may be described as official. Search-engine snippets, blogs, social-media posts, and generated text are not evidence sources.

### 10.2 Initial source registry

| Source                                                                                                       | Intended use                                       | MVP access mode                                                                                    | Important limitation                                                   |
| ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| SISKOP2MI P3MI list — `https://siskop2mi.bp2mi.go.id/profil/lembaga/list_lembaga/p3mi`                       | P3MI identity and details                          | Approved curated snapshot plus direct link; live integration only with permission/stable interface | Registration does not validate the person contacting the user          |
| SISKOP2MI administrative sanctions — `https://siskop2mi.bp2mi.go.id/profil/lembaga/list_lembaga/p3mi_sanksi` | Current sanction information                       | Approved curated snapshot plus direct link                                                         | Status changes; retrieval date is mandatory                            |
| SISKOP2MI vacancies — `https://siskop2mi.bp2mi.go.id/lowongan/list`                                          | Position/country/P3MI matching                     | Limited curated snapshot or manual link-out                                                        | “Not found” does not prove a vacancy is fake                           |
| JDIH KP2MI/BP2MI — `https://jdih.bp2mi.go.id/`                                                               | Applicable placement-fee regulations and decisions | Manually reviewed, versioned rule references                                                       | Rules vary by context and may be amended/revoked                       |
| Permen P2MI/BP2MI No. 17/2025 — `https://jdih.bp2mi.go.id/index.php/Content/produk/8/889000625`              | Baseline placement-fee governance                  | Human-reviewed rule input                                                                          | Must not be simplified into “all fees allowed” or “all fees forbidden” |
| CekRekening — `https://cekrekening.id/`                                                                      | Manual check of reported bank/e-wallet accounts    | Official link-out until an authorized API exists                                                   | No report does not mean an account is safe or official                 |
| AduanNomor — `https://aduannomor.id/`                                                                        | Manual check of reported phone numbers             | Official link-out until an authorized API exists                                                   | No report does not mean a number is official                           |
| Peduli WNI/Kemlu — `https://peduliwni.kemlu.go.id/`                                                          | Consular/procedural direction where applicable     | Official link-out                                                                                  | Some features require authentication or institutional access           |
| Destination-country immigration/labor sites and Indonesian missions                                          | Visa/work-process guidance                         | Curated allowlist and link-out                                                                     | MigLens cannot authenticate a document from an image                   |

### 10.3 Source onboarding requirements

A source must not enter production until it has:

- an owner/maintainer;
- official organization and canonical domain;
- documented purpose and fields used;
- trust tier;
- lawful/authorized access method;
- terms/robots/licence review where relevant;
- refresh cadence;
- last successful retrieval time;
- failure and staleness behavior;
- schema validation;
- sample records and tests;
- limitations shown to users; and
- an emergency disable switch.

### 10.4 Source snapshot requirements

Every imported snapshot must store:

- `source_id`;
- canonical source URL;
- retrieval timestamp and timezone;
- effective date when available;
- parser/importer version;
- content/schema hash;
- record count;
- import status and validation result; and
- superseded snapshot relationship.

Do not overwrite history silently. Evidence results must be reproducible using the rule and source-data versions that generated them.

### 10.5 Access boundaries

- Do not scrape at scale without confirming permission, terms, robots policy, and operational impact.
- Do not bypass login, CAPTCHA, rate limits, access controls, or anti-bot measures.
- Prefer an official API or written read-only data-sharing agreement.
- If no authorized integration exists, use a reviewed snapshot for a clearly scoped test or link the user to the official service.
- Never invent missing records, licence numbers, source URLs, or real-time verification results.

## 11. Decision and status model

### 11.1 AI/OCR boundary

AI/OCR may:

- read visible text;
- identify candidate fields;
- normalize formatting; and
- ask the user to confirm missing or uncertain fields.

AI/OCR must not:

- decide whether an offer is safe or fraudulent;
- infer identity from a face/logo/layout;
- create an official record that was not found;
- turn OCR confidence into a risk score; or
- hide the rules and evidence that produced a status.

### 11.2 Rule engine requirements

- Rules are deterministic pure functions where practical.
- Every rule has a stable ID, version, description, severity, required inputs, output status, user-facing reason, limitation, and next action.
- Missing input produces `unverified`, not `source_match` or `mismatch`.
- Risk-indicator counts derive from the triggered rule collection.
- A rule change requires tests and a short decision-log entry.
- Legal/fee rules require human review before activation.

### 11.3 Prohibited product claims

Do not use:

- “Aman”
- “Pasti penipuan”
- “Terbukti scam”
- “100% akurat”
- “AI memastikan”
- “Anda sudah kebal”
- “Tidak mungkin tertipu”
- “Perekrut resmi tidak pernah …”
- “Kisah nyata” without consented, anonymized, documented provenance

Prefer:

- “Indikator risiko ditemukan”
- “Belum dapat diverifikasi”
- “Tidak sesuai dengan informasi yang diperiksa”
- “Perlu dikonfirmasi melalui kanal resmi”
- “Tunda tindakan sampai bukti tersedia”
- “Ditemukan di sumber yang diperiksa”
- “Skenario komposit berdasarkan pola kasus yang dilaporkan”

## 12. Privacy and data protection requirements

MigLens must be designed consistently with applicable Indonesian data-protection obligations, including UU No. 27 Tahun 2022 on Personal Data Protection. This PRD is not a substitute for legal advice.

### 12.1 Data minimization

- The core flow requires no account.
- Do not request KTP, passport, identity number, selfie, biometric data, exact home address, or full bank-account details.
- Make optional fields clearly optional.
- Ask for the minimum information needed for a specific comparison.
- Keep user inputs in application memory for the active session by default.
- Do not persist offer content in browser storage by default.

### 12.2 Raw uploads

Default MVP behavior:

- OCR runs locally in the browser.
- Raw images are not uploaded to MigLens servers.
- Raw images are not written to logs, analytics, caches, crash reports, or backups.
- Object URLs and image buffers are revoked/released after extraction or when the user leaves the flow.

If server-side processing is introduced later, it requires a separate reviewed design with:

- clear purpose and lawful basis;
- explicit, understandable user notice and consent where required;
- TLS in transit and managed encryption at rest;
- private object storage and unguessable object keys;
- short-lived signed access;
- no public bucket;
- automatic deletion within a documented maximum of 24 hours;
- deletion-job monitoring and failure alerts;
- backup/replica deletion behavior;
- processor/vendor review;
- role-based access and audit logs; and
- an incident-response and user-notification process.

### 12.3 Structured inputs and results

- Do not log request/response bodies containing offer information.
- Mask phone/account numbers in UI after confirmation and in all exports.
- Do not include sensitive values in URLs, query strings, route names, error messages, or analytics.
- Use server-side secrets only; never expose service-role keys in client bundles.
- Apply database row-level security and least privilege if data persistence is later added.
- Set an explicit retention schedule for every stored table before production.
- Provide a deletion path for any research data linked to a participant code.

### 12.4 Consent and research

- Explain the study purpose, data collected, retention, access, and withdrawal process in plain language.
- Use participant codes, not names, in research records.
- Prefer old, redacted, synthetic, or already resolved offers for testing.
- Do not ask a participant to expose an active bank account, identity document, or confidential contract during a group session.
- Do not use the prototype as the sole basis for a real payment or departure decision.
- Record interview/observation sessions only with separate explicit consent.

### 12.5 Sharing and screenshots

- Redact before preview; preview before share.
- Never include the original upload in a generated summary.
- Warn users that device/browser share menus are outside MigLens's control.
- Do not generate public, guessable result URLs.

### 12.6 Incident readiness

Before a public beta, document:

- security contact and escalation owner;
- incident severity levels;
- containment and credential-rotation steps;
- log-preservation rules that avoid collecting new personal data;
- affected-user communication process;
- recovery validation; and
- post-incident review.

## 13. Security requirements and threat model

### 13.1 Main threats

| Threat                                    | Required mitigation                                                                          |
| ----------------------------------------- | -------------------------------------------------------------------------------------------- |
| Sensitive documents uploaded accidentally | Strong pre-upload warning, manual-entry alternative, local OCR, no default persistence       |
| Malicious or malformed image              | Signature/MIME/size validation, decoder isolation where available, memory/time limits        |
| XSS through OCR/source text               | Render as text, framework escaping, no raw HTML, sanitization at boundaries                  |
| SSRF through user-entered/source URLs     | Never fetch arbitrary URLs; use a server-side source allowlist                               |
| Source poisoning/stale data               | Approved source registry, signed/reviewed imports, hashes, timestamps, stale-state UI        |
| Data leakage through logs/analytics       | Structured allowlisted events, redaction, no request-body logs, log tests                    |
| Secret exposure                           | `.env` ignored, server-only secrets, secret scanning, key rotation                           |
| Unauthorized admin changes                | Auth, least privilege, row-level security, audit trail, review/approval workflow             |
| Unsafe external navigation                | Domain allowlist, visible destination, `noopener`/`noreferrer` where appropriate             |
| False reassurance                         | Non-absolute statuses, limitations, company/contact separation, reviewed deterministic rules |
| Dependency compromise                     | Lockfile, dependency review, automated audit, minimal dependencies, timely security updates  |

### 13.2 Baseline controls

- Content Security Policy appropriate for the deployed architecture.
- HSTS, `X-Content-Type-Options: nosniff`, restrictive referrer policy, and frame protections.
- SameSite, Secure, HttpOnly cookies if authentication is introduced.
- CSRF protection for state-changing authenticated requests.
- Rate limiting and abuse protection on server endpoints.
- Schema validation at every external boundary.
- No secrets or production personal data in fixtures.
- Dependency and secret scanning in CI.
- Security review for any new OCR, analytics, storage, or source-integration vendor.

## 14. Technical architecture

### 14.1 Reference stack

Use the existing project stack if one already exists and is maintainable. For a new implementation, the recommended baseline is:

| Layer            | Technology                                                     | Rationale                                                          |
| ---------------- | -------------------------------------------------------------- | ------------------------------------------------------------------ |
| Application      | Next.js App Router + React + TypeScript                        | Mobile web/PWA delivery and strong typed boundaries                |
| Styling          | Tailwind CSS with shared design tokens                         | Consistent responsive UI                                           |
| Forms/validation | React Hook Form + Zod                                          | Editable confirmation form and runtime validation                  |
| Client OCR       | Tesseract.js in a Web Worker                                   | Local processing and responsive UI                                 |
| Rules            | Framework-independent TypeScript modules                       | Deterministic, testable evidence evaluation                        |
| Reference data   | Versioned JSON fixtures first; PostgreSQL/Supabase when needed | Reproducible MVP and later governed persistence                    |
| Testing          | Vitest + Testing Library + Playwright                          | Unit, interaction, and end-to-end coverage                         |
| Deployment       | Vercel or equivalent managed HTTPS hosting                     | Fast PWA testing; production choice requires privacy/vendor review |
| Version control  | Git and GitHub/GitLab                                          | Reviewable changes and CI                                          |

Do not add Supabase, authentication, server OCR, or analytics merely because it is listed as a possible technology. Add a service only when a requirement needs it and its privacy/security impact has been reviewed.

### 14.2 Suggested logical modules

- `offer-input`: local upload/manual entry and extraction state;
- `confirmation`: editable confirmed claims;
- `verification`: orchestration of source comparisons;
- `rules`: pure deterministic evidence and payment rules;
- `evidence`: status model and Evidence Map UI;
- `sources`: source registry, adapters, snapshots, and freshness;
- `actions`: official links, verification message, copy/share redaction;
- `learning`: personal exercise mapping and progress counts;
- `privacy`: redaction, masking, consent, retention, and telemetry allowlist.

### 14.3 Separation of environments and data

- Use separate development, test, and production environments.
- Demo fixtures must live in an explicit fixture directory and carry `isDemo: true`.
- Production code must not fall back silently to demo results.
- Production database credentials must never work in local test or preview environments.
- Preview deployments must use synthetic data only.

## 15. Accessibility, usability, and performance

### 15.1 Accessibility

- Target WCAG 2.2 AA.
- All controls must be keyboard accessible.
- Touch targets should be at least 44 x 44 CSS pixels where practical.
- Form fields require persistent labels and associated error messages.
- Status cannot rely only on color.
- Focus must move predictably after navigation, validation, dialogs, copy feedback, and accordion expansion.
- Support 200% text zoom without loss of content or function.
- Use simple Indonesian; explain P3MI and technical terms on first use.

### 15.2 Mobile and connectivity

- Support viewport widths 360–430 px without horizontal overflow.
- Avoid large initial bundles; load OCR only when the check flow needs it.
- Run OCR in a worker and show progress/cancel controls.
- Public learning content may be cached; sensitive user flow data may not.
- Manual entry must remain available when OCR or network checks fail.

### 15.3 Performance targets

- Core shell usable within 3 seconds on a representative mid/low-tier Android profile under a constrained network, excluding OCR model download.
- Non-OCR interaction response under 200 ms for local actions where practical.
- No main-thread blocking longer than 200 ms during OCR initialization; use a worker and visible loading state.
- Track bundle size and prevent accidental inclusion of server-only packages in the client.

## 16. Test strategy

### 16.1 Automated tests

Unit tests must cover:

- every rule and missing-input branch;
- status mapping and wording;
- indicator count derived from triggered items;
- phone/account masking;
- share-summary redaction;
- source freshness behavior;
- demo/production separation;
- source adapter schema validation; and
- prohibited-copy checks for key screens.

Integration tests must cover:

- OCR/manual input → confirmation → corrected claims;
- corrected claim → updated evidence output;
- unavailable source → stale/manual verification state;
- company found + contact unverified separation;
- payment rule combinations; and
- action links built only from approved source records;
- complaint-channel recommendations mapped to the relevant evidence category;
- complaint-channel cards exposing functional, keyboard-accessible, allowlisted links rather than placeholders; and
- unavailable or unapproved complaint destinations producing an unavailable state with an approved official alternative, never a demo URL.

End-to-end tests must cover:

- the full core journey without dead ends;
- back navigation and retry states;
- copy-message feedback;
- redacted share preview;
- personal-exercise routing;
- 360 px and 430 px viewports;
- keyboard navigation; and
- no sensitive content in network calls during client-side OCR;
- result → complaint-channel selection → appropriate official external destination for contact and payment scenarios; and
- no offer, OCR, phone, account, or evidence content added to external-link URLs or network requests.

Security/data tests must cover:

- invalid file signatures and oversized uploads;
- XSS payloads in OCR and source fields;
- arbitrary URL/SSRF attempts;
- log and analytics payload allowlists;
- secret scanning;
- dependency audit; and
- service-worker cache inspection.

### 16.2 User testing

Initial moderated test:

- 2–3 CPMI;
- 2–3 PMI; and
- 2–3 purna-PMI.

Use 10–15 redacted/resolved/synthetic offers across:

- official, matchable offer;
- confirmed historical scam pattern;
- ambiguous case;
- real-company name with unverified contact;
- missing contract/fee details; and
- strong urgency/payment pressure.

Research questions:

- Can users correct OCR errors?
- Do users understand company vs contact status?
- Can they explain where each result came from?
- Do they understand “not found” vs “not legitimate”?
- Do they know what to do next?
- Does any wording create false reassurance or excessive fear?
- Can they complete the task on their own device and connection?

## 17. Release gates

### 17.1 Prototype test gate

- Full clickable flow exists.
- Demo result is labelled on every applicable screen.
- No invented official data appears.
- Company/contact statuses are separate.
- Share preview is redacted.
- Participants are told the prototype cannot make real-world decisions.

### 17.2 Closed MVP gate

- Client-side OCR and manual fallback work.
- Approved versioned source snapshot is present.
- Source URLs and retrieval dates are correct.
- All critical automated tests pass.
- Privacy notice and research consent are reviewed.
- No raw upload or OCR text appears in server logs/network calls.
- Security review of dependencies, headers, and external links is complete.

### 17.3 Public beta gate

- Legal/privacy review is complete.
- Source access/refresh method is authorized and operationally sustainable.
- Data-retention and deletion procedures are implemented and tested.
- Incident-response ownership is assigned.
- Accessibility review and mobile device testing pass.
- Monitoring excludes personal offer content.
- User support and correction/reporting channels are available.

## 18. Prioritized delivery plan

### Phase 0 — Foundation

- Preserve and audit the existing design.
- Establish typed claim, evidence, source, and rule models.
- Add deterministic demo fixture with explicit labelling.
- Implement privacy-safe logging and environment separation.

### Phase 1 — Testable core

- Manual entry and client-side image OCR.
- Confirmation/correction form.
- P3MI snapshot matching.
- Company/contact separation.
- Payment and time-pressure rules.
- Evidence Map and limitation text.
- Official Action Pack with functional contextual complaint-channel link-outs, copy, and redacted share preview.
- Personal exercise mapping.

### Phase 2 — Source depth

- Governed sanction and vacancy snapshots.
- Admin-only source freshness/import workflow.
- More destination-specific official links.
- Improved contract/visa completeness checklists.

### Phase 3 — Authorized integrations

- Official read-only API/data-sharing integrations where approved.
- Secure optional account/history only if user research demonstrates a need.
- Formal correction/dispute workflow for source data.

## 19. Open questions requiring owner decisions

- Who is accountable for reviewing legal/fee rules and how frequently?
- Has KP2MI/BP2MI authorized reuse, snapshotting, or API access for the intended fields?
- What is the exact research consent and data-deletion process?
- Which destination countries and roles are in the first test scope?
- Is PDF input necessary for the first usability test, or can images/manual input cover it?
- Which organization owns incident response and user support after the hackathon?
- What is the acceptable source staleness threshold for P3MI, sanctions, and vacancies?
- What is the reviewed canonical KP2MI/BP2MI complaint URL or official service-directory/contact alternative for the first test scope, and who owns periodic link validation?

Unresolved questions must not be silently converted into implementation assumptions.

## 20. Definition of done for the MVP

The MVP is done only when:

1. The upload/manual-input-to-action flow is usable without dead ends.
2. Users can correct extraction before checking.
3. Company and contacting-person/channel results are separate.
4. Payment Safety Check lists concrete triggered indicators.
5. The displayed count equals the displayed indicator list.
6. Every evidence item shows reason, source, date, missing information, limitation, and next action.
7. Messages can be previewed and copied.
8. Official links are real, approved, and visibly attributed.
9. Results route to a relevant personal exercise.
10. No absolute safety/fraud claim or unexplained percentage remains.
11. Shared summaries exclude sensitive content.
12. Raw uploads remain on-device in the default flow and are not persisted.
13. Demo and production data cannot be confused.
14. Statuses work without color and at 360–430 px.
15. Build, lint, type-check, unit, integration, and end-to-end tests pass.
16. Source provenance and rule versions can reproduce a result.
17. Security, privacy, and research release gates for the intended test are complete.
18. Complaint actions map relevant evidence to approved official channels, contain no placeholders, transmit no user data, and provide an unavailable state when no reviewed destination exists.

## Appendix A — Canonical copy

Use these exact statements unless a reviewed content change replaces them:

**OCR review**

> Periksa kembali informasi berikut. Sistem dapat keliru membaca teks pada gambar.

**Upload warning**

> Jangan unggah KTP, paspor, nomor identitas, atau dokumen yang memuat data pribadi sensitif.

**Payment action**

> Tunda pembayaran sampai identitas penghubung, rincian biaya, dan tujuan pembayaran dapat diverifikasi melalui kanal resmi.

**Verification message**

> Mohon kirimkan tautan lowongan resmi, nama dan nomor izin P3MI, draf kontrak, rincian biaya tertulis, serta kontak kantor resmi yang dapat saya hubungi untuk melakukan verifikasi.

**Complaint action**

> Laporkan tawaran atau kontak mencurigakan

**Complaint hand-off notice**

> Anda akan membuka layanan resmi di luar MigLens. MigLens tidak mengirim laporan atau data tawaran secara otomatis. Periksa kembali informasi yang ingin Anda berikan pada layanan tersebut.

**Exercise rationale**

> Latihan ini direkomendasikan berdasarkan bagian yang masih perlu Anda verifikasi.

**Product limitation**

> MigLens membantu menguraikan klaim, membandingkan bukti, dan menunjukkan informasi yang masih perlu diverifikasi. Hasil ini bukan keputusan hukum atau jaminan bahwa suatu tawaran aman maupun penipuan.

## Appendix B — Legal/privacy references

- UU No. 27 Tahun 2022 on Personal Data Protection: `https://jdih.komdigi.go.id/produk_hukum/view/id/832/t/undangundang+nomor+27+tahun+2022`
- JDIH KP2MI/BP2MI: `https://jdih.bp2mi.go.id/`
- Permen P2MI/BP2MI No. 17 Tahun 2025: `https://jdih.bp2mi.go.id/index.php/Content/produk/8/889000625`

These links establish the initial reference set. Their status and applicability must be rechecked before production use.
