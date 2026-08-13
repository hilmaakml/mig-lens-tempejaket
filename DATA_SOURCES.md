# MigLens Data Sources and Evidence Governance

> Status: Mandatory for all source, snapshot, matching, and demo work  
> Version: 1.1  
> Last updated: 11 August 2026

## 1. Core rule

MigLens evaluates separate claims against the specific sources checked. It does not verify an entire offer with one lookup.

Keep these categories separate:

- company/P3MI;
- contacting person and channel;
- vacancy;
- fees and payment;
- contract availability/completeness;
- visa availability/type; and
- time pressure.

A company found in an official source does not prove that the contact, vacancy, bank account, contract, or visa is official.

## 2. Source tiers

| Tier | Class                     | Permitted use                                                                                                |
| ---- | ------------------------- | ------------------------------------------------------------------------------------------------------------ |
| 1    | Primary official record   | Compare names, licence/status, official contacts, vacancies, sanctions, or legal fields within stated limits |
| 2    | Official guidance/channel | Explain procedures and provide a manual verification or complaint path                                       |
| 3    | User-provided information | Define the claim being checked; never independent proof                                                      |
| 4    | Community report/signal   | Risk signal only; no report is never proof of safety                                                         |

Only Tiers 1 and 2 may be labelled official. Search snippets, blogs, social posts, generated text, and demo fixtures are not evidence sources.

## 3. Initial source registry

| Source                                                                                         | Intended use                                    | MVP mode                                                    | Critical limitation                                           |
| ---------------------------------------------------------------------------------------------- | ----------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------- |
| [SISKOP2MI P3MI list](https://siskop2mi.bp2mi.go.id/profil/lembaga/list_lembaga/p3mi)          | P3MI identity/details                           | Approved curated snapshot + link; live only when authorized | Registration does not validate the person contacting the user |
| [SISKOP2MI sanctions](https://siskop2mi.bp2mi.go.id/profil/lembaga/list_lembaga/p3mi_sanksi)   | Administrative-sanction status                  | Approved snapshot + link                                    | Status changes; retrieval date is mandatory                   |
| [SISKOP2MI vacancies](https://siskop2mi.bp2mi.go.id/lowongan/list)                             | Compare P3MI, role, destination                 | Limited snapshot or manual link                             | Not found does not prove a vacancy is fake                    |
| [JDIH KP2MI/BP2MI](https://jdih.bp2mi.go.id/)                                                  | Fee rules and official decisions                | Human-reviewed, versioned rule reference                    | Applicability and current status require review               |
| [Permen P2MI/BP2MI No. 17/2025](https://jdih.bp2mi.go.id/index.php/Content/produk/8/889000625) | Initial placement-fee governance                | Human-reviewed rule input                                   | Never simplify to “all fees allowed/forbidden”                |
| [CekRekening](https://cekrekening.id/)                                                         | Manual check of reported bank/e-wallet accounts | Official link-out until authorized API                      | No report does not mean safe or official                      |
| [AduanNomor](https://aduannomor.id/)                                                           | Manual check of reported phone numbers          | Official link-out until authorized API                      | No report does not mean official                              |
| [Peduli WNI](https://peduliwni.kemlu.go.id/)                                                   | Consular/procedural direction                   | Official link-out                                           | Some functions require login/institutional access             |
| Destination-country immigration/labor sites and Indonesian missions                            | Visa/work-process guidance                      | Reviewed allowlist + link-out                               | An image cannot prove document authenticity                   |

Recheck the current URL, availability, terms, and regulatory applicability before production use.

## 4. MVP integration policy

Until a documented API or permission exists:

- do not scrape official sites at scale;
- do not bypass login, CAPTCHA, rate limits, access controls, robots rules, or anti-bot measures;
- use a small, reviewed snapshot only for the explicit test scope;
- store the source URL and retrieval date;
- provide a direct official link for manual verification; and
- display `Belum dapat diperiksa` when the source is unavailable or not present in the approved dataset.

If the app uses a limited snapshot, say:

> Berdasarkan data uji yang diperbarui pada [tanggal].

If a name is absent, say:

> Tidak ditemukan dalam cakupan sumber yang diperiksa.

Never say `perusahaan ilegal` merely because a lookup returned no record.

## 5. Source registry contract

Every source must define:

- stable `sourceId` and human-readable name;
- publisher and canonical HTTPS URL/domain;
- source tier;
- fields used and purpose;
- access method and authorization status;
- retrieval timestamp and effective date when available;
- freshness threshold;
- schema/parser version;
- known limitations;
- expected failure behavior;
- owner/reviewer; and
- emergency disable state.

A source cannot enter production until access is authorized, schema validation and tests exist, refresh/failure behavior is defined, and user-visible limitations have been reviewed.

## 6. Snapshot contract

Store approved snapshots under `data/sources/`, separate from fixtures.

Each snapshot includes:

- `snapshotId`;
- `sourceId`;
- canonical URL;
- retrieval timestamp in UTC;
- effective date when available;
- retrieval method;
- parser/schema version;
- content/schema checksum;
- record count;
- import and validation status;
- reviewer/review status;
- freshness/staleness status; and
- superseded-snapshot relation.

Do not silently overwrite history. Preserve enough metadata to reproduce a result with the rule and snapshot versions used.

## 7. Data modes and runtime separation

Represent data mode with a discriminated union or equally strong typed boundary:

```ts
type EvidenceDataMode =
  | { readonly kind: 'demo'; readonly fixtureId: string }
  | { readonly kind: 'snapshot'; readonly snapshotId: string }
  | { readonly kind: 'live'; readonly sourceId: string }
  | { readonly kind: 'source_unavailable'; readonly sourceId: string };
```

Rules:

- demo fixtures live under `data/fixtures/` and include `isDemo: true`;
- fixtures use fictional names, identifiers, and reserved domains such as `example.com`;
- preview deployments use synthetic data only unless an approved snapshot is explicitly provided;
- a production adapter fails closed and never imports a fixture;
- source failure never becomes a demo success;
- every demo result visibly says `Contoh hasil prototipe`; and
- no realistic licence, account, phone, identity, or confidential offer is invented.

## 8. Matching rules

- Preserve raw source values for provenance and use separate normalized values for matching.
- Normalize company names conservatively and test choices around `PT`, punctuation, and spacing.
- Normalize Indonesian phone variants such as `+62` and `0` only for comparison; display masked values.
- Exact or reviewed normalized matches may produce `source_match`.
- Partial/fuzzy matches remain `unverified` unless a conservative, reviewed method and user-visible explanation support another result.
- Never automatically match a personal name as proof of identity.
- Never use a search-engine result as the official record.
- Missing required input produces `unverified`.

## 9. Status and failure semantics

Canonical evidence statuses:

| Internal value   | UI label                   |
| ---------------- | -------------------------- |
| `source_match`   | Sesuai dengan sumber       |
| `unverified`     | Belum dapat diverifikasi   |
| `mismatch`       | Tidak sesuai               |
| `risk_indicator` | Indikator risiko ditemukan |

Distinguish these states:

- source record matched;
- record not found within the checked scope;
- source unavailable;
- snapshot stale;
- input incomplete;
- schema/import failure; and
- comparison mismatch.

Do not turn all failures into `not found`. If a previous approved snapshot is used, show its actual age and never imply a live check.

## 10. Evidence item contract

Every Evidence Map item includes:

- confirmed user claim;
- source finding or rule input;
- canonical status;
- plain-language reason;
- source name, tier, and approved URL;
- retrieval and check timestamps;
- exact comparison method;
- missing information;
- limitation;
- concrete next action;
- rule ID/version when rule-based; and
- snapshot version when source-backed.

`Informasi pengguna` may be the source name for a rule-only indicator, but user input must never be presented as independent verification.

### 5.1 Language and source fidelity

- Store source records, official names, URLs, identifiers, dates, and quoted wording in their original form.
- Localize MigLens's labels, explanations, limitations, and next actions; do not mutate the underlying source record when the interface language changes.
- An English explanation of Indonesian official wording must be labelled as a MigLens translation or summary, not as an official English publication.
- Preserve a path to the original official source and wording.
- The same source ID, snapshot ID, rule version, status code, and evidence finding must be used in both interface languages.
- Missing English source material is not a source failure and must not trigger demo fallback; show the original source with a localized limitation.

## 11. Initial check behavior

### Company/P3MI

Show found/not-found-within-scope/unavailable, official fields that actually exist, sanctions if checked, source, and dates. Never extend this status to the contact or offer.

### Contact channel

Compare the confirmed phone/email/username with the official contact fields in the approved record. Outcomes: matching listed contact, different from listed contact, or unverified. A mismatch requires independent confirmation; it is not a fraud verdict.

### Vacancy

Compare company, position, and destination only when a current approved vacancy source exists. Explain fields and method. Partial data remains unverified.

### Payment and fees

Use versioned deterministic rules and a reviewed legal source. Lack of written detail, a different recipient, an unverified personal account, mismatch with the agreement, and immediate pressure may trigger separate risk indicators. Do not encode a blanket `PMI never pays any cost` rule.

### Contract and visa

MVP checks availability/completeness only. Do not authenticate from a screenshot, logo, formatting, or OCR result.

## 12. Prohibited source claims

Never claim:

- `Aman`;
- `Pasti penipuan` or `Terbukti scam`;
- `Perusahaan ilegal` solely because it was not found;
- `Kontak resmi` solely because the company exists;
- `Rekening aman` because no report was found;
- `Visa/kontrak asli` based on an image;
- `Verifikasi real-time` when using a snapshot; or
- an official partnership/integration without written evidence.

Prefer `Ditemukan di sumber yang diperiksa`, `Belum dapat diverifikasi`, `Tidak sesuai dengan informasi yang diperiksa`, and a clear next action.

Equivalent English UI wording must preserve these scoped meanings, for example `Found in the source checked`, `Not yet verified`, and `Does not match the information checked`. Translation must never strengthen a scoped status into `official`, `safe`, `illegal`, or `fraudulent`.

## 13. Open governance decisions

Before expanding beyond a test snapshot, the product owner must resolve:

- authorization for data reuse or API access;
- source owner and review cadence;
- acceptable staleness thresholds;
- legal reviewer for fee rules;
- initial destination-country and role scope;
- correction/dispute process; and
- sustainable source monitoring after the hackathon.
