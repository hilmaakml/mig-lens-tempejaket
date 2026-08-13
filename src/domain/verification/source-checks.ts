import {
  message,
  sourceValue,
  type EvidenceItem,
  type LocalizedText,
} from '@/domain/evidence/evidence-item';
import { isBlank, type OfferClaim } from '@/domain/claims/offer-claim';
import {
  normalizeCompanyName,
  normalizeContactHandle,
  normalizePlainText,
} from '@/domain/claims/normalize';
import type { P3miRecord, SourceSnapshot } from '@/domain/sources/snapshot';
import { getSource } from '@/domain/sources/source-registry';
import { maskContactHandle } from '@/domain/privacy/mask';
import type { RuleContext } from '@/domain/rules/rule-types';

/**
 * Source comparisons (PRD FR-05 to FR-07, FR-09).
 *
 * Each category is checked separately: a company found in the reference dataset says
 * nothing about the contact, the vacancy, the contract, the visa, or the bank account
 * (DATA_SOURCES.md 1).
 */

const P3MI_SOURCE_ID = 'siskop2mi-p3mi';
const VACANCY_SOURCE_ID = 'siskop2mi-vacancies';

export interface CompanyCheckResult {
  readonly item: EvidenceItem;
  readonly matchedRecord: P3miRecord | null;
}

function sourceMeta(sourceId: string) {
  const entry = getSource(sourceId);
  return {
    nameKey: entry?.nameKey ?? 'source.unknown',
    url: entry?.canonicalUrl ?? null,
    tier: entry?.tier ?? 'official_primary',
  } as const;
}

function findCompanyRecord(
  snapshot: SourceSnapshot,
  companyName: string,
): P3miRecord | null {
  const normalized = normalizeCompanyName(companyName);
  if (normalized.length === 0) return null;
  return (
    snapshot.p3miRecords.find(
      (record) => normalizeCompanyName(record.officialName) === normalized,
    ) ?? null
  );
}

/** FR-05. "Not found" is scoped to the dataset checked and is never called illegal. */
export function checkCompany(
  claim: Readonly<OfferClaim>,
  context: Readonly<RuleContext>,
): CompanyCheckResult {
  const meta = sourceMeta(P3MI_SOURCE_ID);
  const base = {
    id: 'check:company',
    category: 'company',
    checkedAt: context.checkedAt,
    sourceTier: meta.tier,
    ruleId: null,
    ruleVersion: null,
  } as const;

  if (isBlank(claim.companyName)) {
    return {
      matchedRecord: null,
      item: {
        ...base,
        claim: message('claim.not_provided'),
        finding: null,
        status: 'unverified',
        reason: message('check.company.reason_missing_input'),
        sourceName: message('source.user_information'),
        sourceUrl: null,
        sourceTier: 'user_provided',
        retrievedAt: null,
        method: 'manual',
        missingInformation: [message('missing.company_name')],
        limitation: message('check.company.limitation'),
        nextAction: message('check.company.next_action_missing'),
        snapshotId: null,
      },
    };
  }

  const claimText: LocalizedText = sourceValue(claim.companyName);

  // No approved dataset available -> "belum dapat diperiksa", never "tidak ditemukan"
  // and never a demo fallback (DATA_SOURCES.md 4 and 9).
  if (!context.snapshot) {
    return {
      matchedRecord: null,
      item: {
        ...base,
        claim: claimText,
        finding: null,
        status: 'unverified',
        reason: message('check.company.reason_source_unavailable'),
        sourceName: message(meta.nameKey),
        sourceUrl: meta.url,
        retrievedAt: null,
        method: 'manual',
        missingInformation: [message('missing.official_company_record')],
        limitation: message('check.company.limitation_source_unavailable'),
        nextAction: message('check.company.next_action_manual'),
        snapshotId: null,
      },
    };
  }

  const record = findCompanyRecord(context.snapshot, claim.companyName);
  const retrievedAt = context.snapshot.retrievedAt;
  const snapshotId = context.snapshot.snapshotId;

  if (!record) {
    return {
      matchedRecord: null,
      item: {
        ...base,
        claim: claimText,
        finding: message('check.company.finding_not_in_scope'),
        status: 'unverified',
        reason: message('check.company.reason_not_found'),
        sourceName: message(meta.nameKey),
        sourceUrl: meta.url,
        retrievedAt,
        method: 'normalized',
        missingInformation: [message('missing.official_company_record')],
        limitation: message('check.company.limitation_not_found'),
        nextAction: message('check.company.next_action_manual'),
        snapshotId,
      },
    };
  }

  const isStale = context.snapshotFreshness === 'stale';
  return {
    matchedRecord: record,
    item: {
      ...base,
      claim: claimText,
      finding: sourceValue(record.officialName),
      // A stale dataset cannot support a current match claim.
      status: isStale ? 'unverified' : 'source_match',
      reason: isStale
        ? message('check.company.reason_stale')
        : message('check.company.reason_match'),
      sourceName: message(meta.nameKey),
      sourceUrl: meta.url,
      retrievedAt,
      method: 'normalized',
      missingInformation: record.sanctionNote
        ? [message('missing.sanction_confirmation')]
        : [message('missing.licence_reconfirmation')],
      limitation: message('check.company.limitation_match'),
      nextAction: message('check.company.next_action_match'),
      snapshotId,
    },
  };
}

export interface ContactCheckResult {
  readonly item: EvidenceItem;
  readonly isVerified: boolean;
}

/**
 * FR-06. Company and contact stay separate: this check only asks whether the handle that
 * contacted the user appears in the official contact fields of the matched record.
 */
export function checkContact(
  claim: Readonly<OfferClaim>,
  context: Readonly<RuleContext>,
  matchedRecord: P3miRecord | null,
): ContactCheckResult {
  const meta = sourceMeta(P3MI_SOURCE_ID);
  const base = {
    id: 'check:contact',
    category: 'contact',
    checkedAt: context.checkedAt,
    ruleId: null,
    ruleVersion: null,
  } as const;

  const handle = normalizeContactHandle(claim.contactHandle);

  if (handle.kind === 'unreadable') {
    return {
      isVerified: false,
      item: {
        ...base,
        claim: message('claim.not_provided'),
        finding: null,
        status: 'unverified',
        reason: message('check.contact.reason_missing_input'),
        sourceName: message('source.user_information'),
        sourceUrl: null,
        sourceTier: 'user_provided',
        retrievedAt: null,
        method: 'manual',
        missingInformation: [message('missing.contact_handle')],
        limitation: message('check.contact.limitation'),
        nextAction: message('check.contact.next_action'),
        snapshotId: null,
      },
    };
  }

  // The handle is compared in normalized form but only ever *displayed* masked, including
  // inside evidence output and any export (PRD FR-06, SECURITY.md 7).
  const claimText = sourceValue(maskContactHandle(claim.contactHandle));

  if (!matchedRecord) {
    return {
      isVerified: false,
      item: {
        ...base,
        claim: claimText,
        finding: null,
        status: 'unverified',
        reason: message('check.contact.reason_no_record'),
        sourceName: message(meta.nameKey),
        sourceUrl: meta.url,
        sourceTier: meta.tier,
        retrievedAt: context.snapshot?.retrievedAt ?? null,
        method: 'manual',
        missingInformation: [message('missing.official_contact_list')],
        limitation: message('check.contact.limitation'),
        nextAction: message('check.contact.next_action'),
        snapshotId: context.snapshot?.snapshotId ?? null,
      },
    };
  }

  const listedHandles = matchedRecord.officialContacts
    .filter((contact) => contact.kind === 'phone' || contact.kind === 'email')
    .map((contact) => normalizeContactHandle(contact.value));

  const isListed = listedHandles.some(
    (listed) => listed.kind === handle.kind && listed.value === handle.value,
  );

  const shared = {
    ...base,
    claim: claimText,
    sourceName: message(meta.nameKey),
    sourceUrl: meta.url,
    sourceTier: meta.tier,
    retrievedAt: context.snapshot?.retrievedAt ?? null,
    method: 'normalized',
    snapshotId: context.snapshot?.snapshotId ?? null,
  } as const;

  if (isListed) {
    return {
      isVerified: true,
      item: {
        ...shared,
        finding: message('check.contact.finding_listed'),
        status: 'source_match',
        reason: message('check.contact.reason_listed'),
        missingInformation: [message('missing.person_identity_confirmation')],
        limitation: message('check.contact.limitation_listed'),
        nextAction: message('check.contact.next_action_listed'),
      },
    };
  }

  // Only a source that guarantees a complete contact list can support "different from the
  // official contact". Otherwise an unlisted handle is simply not yet verified.
  const canAssertMismatch =
    matchedRecord.isContactListComplete &&
    listedHandles.some((listed) => listed.kind === handle.kind);

  return {
    isVerified: false,
    item: {
      ...shared,
      finding: canAssertMismatch
        ? message('check.contact.finding_not_listed_complete')
        : message('check.contact.finding_not_listed'),
      status: canAssertMismatch ? 'mismatch' : 'unverified',
      reason: canAssertMismatch
        ? message('check.contact.reason_mismatch')
        : message('check.contact.reason_not_listed'),
      missingInformation: [message('missing.official_contact_confirmation')],
      limitation: message('check.contact.limitation'),
      nextAction: message('check.contact.next_action'),
    },
  };
}

/** FR-07. A vacancy absent from the dataset is not evidence that the vacancy is fake. */
export function checkVacancy(
  claim: Readonly<OfferClaim>,
  context: Readonly<RuleContext>,
): EvidenceItem {
  const meta = sourceMeta(VACANCY_SOURCE_ID);
  const base = {
    id: 'check:vacancy',
    category: 'vacancy',
    checkedAt: context.checkedAt,
    sourceTier: meta.tier,
    ruleId: null,
    ruleVersion: null,
  } as const;

  const hasInput =
    !isBlank(claim.position) &&
    !isBlank(claim.destinationCountry) &&
    !isBlank(claim.companyName);

  const claimText: LocalizedText = hasInput
    ? sourceValue(`${claim.position} · ${claim.destinationCountry}`)
    : message('claim.not_provided');

  if (!hasInput) {
    return {
      ...base,
      claim: claimText,
      finding: null,
      status: 'unverified',
      reason: message('check.vacancy.reason_missing_input'),
      sourceName: message('source.user_information'),
      sourceUrl: null,
      sourceTier: 'user_provided',
      retrievedAt: null,
      method: 'manual',
      missingInformation: [message('missing.vacancy_fields')],
      limitation: message('check.vacancy.limitation'),
      nextAction: message('check.vacancy.next_action'),
      snapshotId: null,
    };
  }

  const vacancies = context.snapshot?.vacancyRecords ?? [];
  if (!context.snapshot || vacancies.length === 0) {
    return {
      ...base,
      claim: claimText,
      finding: null,
      status: 'unverified',
      reason: message('check.vacancy.reason_source_unavailable'),
      sourceName: message(meta.nameKey),
      sourceUrl: meta.url,
      retrievedAt: context.snapshot?.retrievedAt ?? null,
      method: 'manual',
      missingInformation: [message('missing.official_vacancy_link')],
      limitation: message('check.vacancy.limitation'),
      nextAction: message('check.vacancy.next_action'),
      snapshotId: context.snapshot?.snapshotId ?? null,
    };
  }

  const company = normalizeCompanyName(claim.companyName);
  const position = normalizePlainText(claim.position);
  const country = normalizePlainText(claim.destinationCountry);

  const sameCompany = vacancies.filter(
    (record) => normalizeCompanyName(record.companyName) === company,
  );
  const exact = sameCompany.find(
    (record) =>
      normalizePlainText(record.position) === position &&
      normalizePlainText(record.destinationCountry) === country,
  );

  const shared = {
    ...base,
    claim: claimText,
    sourceName: message(meta.nameKey),
    sourceUrl: meta.url,
    retrievedAt: context.snapshot.retrievedAt,
    method: 'normalized',
    snapshotId: context.snapshot.snapshotId,
  } as const;

  if (exact) {
    return {
      ...shared,
      finding: sourceValue(`${exact.position} · ${exact.destinationCountry}`),
      status: 'source_match',
      reason: message('check.vacancy.reason_match'),
      missingInformation: [message('missing.vacancy_detail_confirmation')],
      limitation: message('check.vacancy.limitation'),
      nextAction: message('check.vacancy.next_action_match'),
    };
  }

  const samePositionDifferentCountry = sameCompany.find(
    (record) => normalizePlainText(record.position) === position,
  );
  if (samePositionDifferentCountry) {
    return {
      ...shared,
      finding: sourceValue(
        `${samePositionDifferentCountry.position} · ${samePositionDifferentCountry.destinationCountry}`,
      ),
      status: 'mismatch',
      reason: message('check.vacancy.reason_mismatch'),
      missingInformation: [message('missing.vacancy_country_explanation')],
      limitation: message('check.vacancy.limitation'),
      nextAction: message('check.vacancy.next_action'),
    };
  }

  return {
    ...shared,
    finding: message('check.vacancy.finding_not_in_scope'),
    status: 'unverified',
    reason: message('check.vacancy.reason_not_found'),
    missingInformation: [message('missing.official_vacancy_link')],
    limitation: message('check.vacancy.limitation'),
    nextAction: message('check.vacancy.next_action'),
  };
}

/** FR-09. Availability and completeness only — never document authenticity. */
export function checkContract(
  claim: Readonly<OfferClaim>,
  context: Readonly<RuleContext>,
): EvidenceItem {
  const provided = claim.contractStatus === 'provided';
  const unknown = claim.contractStatus === 'unknown';
  return {
    id: 'check:contract',
    category: 'contract',
    claim: unknown
      ? message('claim.not_provided')
      : message(`claim.contract.${claim.contractStatus}`),
    finding: null,
    // Availability is not authenticity: a supplied contract is still `unverified`.
    status: 'unverified',
    reason: provided
      ? message('check.contract.reason_provided')
      : unknown
        ? message('check.contract.reason_unknown')
        : message('check.contract.reason_not_provided'),
    sourceName: message('source.user_information'),
    sourceUrl: null,
    sourceTier: 'user_provided',
    retrievedAt: null,
    checkedAt: context.checkedAt,
    method: 'manual',
    missingInformation: provided
      ? [message('missing.contract_authenticity')]
      : [message('missing.contract_draft')],
    limitation: message('check.contract.limitation'),
    nextAction: provided
      ? message('check.contract.next_action_provided')
      : message('check.contract.next_action'),
    ruleId: null,
    ruleVersion: null,
    snapshotId: null,
  };
}

export function checkVisa(
  claim: Readonly<OfferClaim>,
  context: Readonly<RuleContext>,
): EvidenceItem {
  const provided = claim.visaStatus === 'provided';
  const unknown = claim.visaStatus === 'unknown';
  return {
    id: 'check:visa',
    category: 'visa',
    claim: unknown
      ? message('claim.not_provided')
      : isBlank(claim.visaType)
        ? message(`claim.visa.${claim.visaStatus}`)
        : sourceValue(claim.visaType),
    finding: null,
    status: 'unverified',
    reason: provided
      ? message('check.visa.reason_provided')
      : unknown
        ? message('check.visa.reason_unknown')
        : message('check.visa.reason_not_provided'),
    sourceName: message('source.user_information'),
    sourceUrl: null,
    sourceTier: 'user_provided',
    retrievedAt: null,
    checkedAt: context.checkedAt,
    method: 'manual',
    missingInformation: provided
      ? [message('missing.visa_authenticity')]
      : [message('missing.visa_type')],
    limitation: message('check.visa.limitation'),
    nextAction: message('check.visa.next_action'),
    ruleId: null,
    ruleVersion: null,
    snapshotId: null,
  };
}
