import {
  message,
  sourceValue,
  type EvidenceItem,
  type EvidenceCategory,
  type EvidenceStatus,
  type LocalizedText,
} from '@/domain/evidence/evidence-item';
import type { OfferClaim } from '@/domain/claims/offer-claim';
import { isBlank } from '@/domain/claims/offer-claim';
import type { RuleContext, VerificationRule } from '@/domain/rules/rule-types';
import type { MessageKey } from '@/content/locales/message-key';
import {
  maskContactHandle,
  maskLongDigitRuns,
  maskPersonName,
} from '@/domain/privacy/mask';

/**
 * Deterministic payment and time-pressure rules (PRD FR-08).
 *
 * These rules read only the user's confirmed input. They describe what is missing or
 * unusual about a payment request; none of them is a fraud verdict, and none of them
 * encodes a blanket "PMI never pays anything" rule — placement-fee governance varies by
 * destination, scheme, and regulation and needs human legal review (DATA_SOURCES.md 11).
 */

const RULE_VERSION = '1.0.0';

/** Legal/fee reference reviewed for this rule set (source id `permen-17-2025`). */
export const FEE_RULE_SOURCE_URL =
  'https://jdih.bp2mi.go.id/index.php/Content/produk/8/889000625';

interface BuildArgs {
  readonly ruleId: string;
  readonly category: EvidenceCategory;
  readonly status: EvidenceStatus;
  readonly claim: LocalizedText;
  readonly finding: LocalizedText | null;
  readonly reasonKey: MessageKey;
  readonly missingKeys: readonly MessageKey[];
  readonly limitationKey: MessageKey;
  readonly nextActionKey: MessageKey;
  readonly context: RuleContext;
  readonly sourceUrl?: string | null;
}

function buildRuleItem(args: BuildArgs): EvidenceItem {
  return {
    id: `rule:${args.ruleId}`,
    category: args.category,
    claim: args.claim,
    finding: args.finding,
    status: args.status,
    reason: message(args.reasonKey),
    // Rule-only checks are user-provided information, never independent verification.
    sourceName: message('source.user_information'),
    sourceUrl: args.sourceUrl ?? null,
    sourceTier: 'user_provided',
    retrievedAt: null,
    checkedAt: args.context.checkedAt,
    method: 'rule_based',
    missingInformation: args.missingKeys.map((key) => message(key)),
    limitation: message(args.limitationKey),
    nextAction: message(args.nextActionKey),
    ruleId: args.ruleId,
    ruleVersion: RULE_VERSION,
    snapshotId: null,
  };
}

const unknownClaim = message('claim.not_provided');

/** 1. The person or account contacting the user has not been verified. */
export const contactUnverifiedPaymentRule: VerificationRule = {
  id: 'PAYMENT_CONTACT_UNVERIFIED',
  version: RULE_VERSION,
  evaluate: (claim, context) => {
    if (isBlank(claim.contactHandle)) {
      return buildRuleItem({
        ruleId: 'PAYMENT_CONTACT_UNVERIFIED',
        category: 'payment',
        status: 'unverified',
        claim: unknownClaim,
        finding: null,
        reasonKey: 'rule.payment_contact_unverified.reason_missing',
        missingKeys: ['missing.contact_handle'],
        limitationKey: 'rule.payment_contact_unverified.limitation',
        nextActionKey: 'rule.payment_contact_unverified.next_action',
        context,
      });
    }
    if (context.isContactVerified) return null;
    return buildRuleItem({
      ruleId: 'PAYMENT_CONTACT_UNVERIFIED',
      category: 'payment',
      status: 'risk_indicator',
      // Displayed masked; matching already happened against the normalized value.
      claim: sourceValue(maskContactHandle(claim.contactHandle)),
      finding: message('rule.payment_contact_unverified.finding'),
      reasonKey: 'rule.payment_contact_unverified.reason',
      missingKeys: ['missing.official_contact_confirmation'],
      limitationKey: 'rule.payment_contact_unverified.limitation',
      nextActionKey: 'rule.payment_contact_unverified.next_action',
      context,
    });
  },
};

/** 2. Payment is requested to an unverified personal account. */
export const personalAccountRule: VerificationRule = {
  id: 'PAYMENT_PERSONAL_ACCOUNT_UNVERIFIED',
  version: RULE_VERSION,
  evaluate: (claim, context) => {
    if (claim.accountType === 'unknown') {
      return buildRuleItem({
        ruleId: 'PAYMENT_PERSONAL_ACCOUNT_UNVERIFIED',
        category: 'payment',
        status: 'unverified',
        claim: unknownClaim,
        finding: null,
        reasonKey: 'rule.payment_personal_account.reason_missing',
        missingKeys: ['missing.account_type'],
        limitationKey: 'rule.payment_personal_account.limitation',
        nextActionKey: 'rule.payment_personal_account.next_action',
        context,
      });
    }
    if (claim.accountType !== 'personal') return null;
    if (context.isContactVerified && claim.officialChannelConfirmation === 'done')
      return null;
    return buildRuleItem({
      ruleId: 'PAYMENT_PERSONAL_ACCOUNT_UNVERIFIED',
      category: 'payment',
      status: 'risk_indicator',
      claim: isBlank(claim.paymentRecipient)
        ? message('claim.personal_account')
        : sourceValue(maskPersonName(claim.paymentRecipient)),
      finding: message('rule.payment_personal_account.finding'),
      reasonKey: 'rule.payment_personal_account.reason',
      missingKeys: ['missing.official_payment_destination'],
      limitationKey: 'rule.payment_personal_account.limitation',
      nextActionKey: 'rule.payment_personal_account.next_action',
      context,
    });
  },
};

/** 3. No written fee breakdown has been provided. */
export const writtenFeeBreakdownRule: VerificationRule = {
  id: 'PAYMENT_NO_WRITTEN_FEE_BREAKDOWN',
  version: RULE_VERSION,
  evaluate: (claim, context) => {
    if (claim.writtenFeeBreakdown === 'unknown') {
      return buildRuleItem({
        ruleId: 'PAYMENT_NO_WRITTEN_FEE_BREAKDOWN',
        category: 'payment',
        status: 'unverified',
        claim: unknownClaim,
        finding: null,
        reasonKey: 'rule.payment_no_fee_breakdown.reason_missing',
        missingKeys: ['missing.written_fee_breakdown'],
        limitationKey: 'rule.payment_no_fee_breakdown.limitation',
        nextActionKey: 'rule.payment_no_fee_breakdown.next_action',
        context,
        sourceUrl: FEE_RULE_SOURCE_URL,
      });
    }
    if (claim.writtenFeeBreakdown === 'provided') return null;
    return buildRuleItem({
      ruleId: 'PAYMENT_NO_WRITTEN_FEE_BREAKDOWN',
      category: 'payment',
      status: 'risk_indicator',
      claim: message('claim.fee_breakdown_not_provided'),
      finding: message('rule.payment_no_fee_breakdown.finding'),
      reasonKey: 'rule.payment_no_fee_breakdown.reason',
      missingKeys: ['missing.written_fee_breakdown'],
      limitationKey: 'rule.payment_no_fee_breakdown.limitation',
      nextActionKey: 'rule.payment_no_fee_breakdown.next_action',
      context,
      sourceUrl: FEE_RULE_SOURCE_URL,
    });
  },
};

/** 4. The user is pressured to transfer immediately or on the same day. */
export const timePressureRule: VerificationRule = {
  id: 'TIME_PRESSURE_IMMEDIATE_TRANSFER',
  version: RULE_VERSION,
  evaluate: (claim, context) => {
    if (claim.timePressure === 'unknown') {
      return buildRuleItem({
        ruleId: 'TIME_PRESSURE_IMMEDIATE_TRANSFER',
        category: 'time_pressure',
        status: 'unverified',
        claim: unknownClaim,
        finding: null,
        reasonKey: 'rule.time_pressure.reason_missing',
        missingKeys: ['missing.deadline_information'],
        limitationKey: 'rule.time_pressure.limitation',
        nextActionKey: 'rule.time_pressure.next_action',
        context,
      });
    }
    if (claim.timePressure !== 'same_day') return null;
    return buildRuleItem({
      ruleId: 'TIME_PRESSURE_IMMEDIATE_TRANSFER',
      category: 'time_pressure',
      status: 'risk_indicator',
      claim: isBlank(claim.paymentDeadlineNote)
        ? message('claim.same_day_deadline')
        : sourceValue(maskLongDigitRuns(claim.paymentDeadlineNote)),
      finding: message('rule.time_pressure.finding'),
      reasonKey: 'rule.time_pressure.reason',
      missingKeys: ['missing.deadline_justification'],
      limitationKey: 'rule.time_pressure.limitation',
      nextActionKey: 'rule.time_pressure.next_action',
      context,
    });
  },
};

/** 5. The payment recipient differs from the party named in the reviewed agreement. */
export const recipientMismatchRule: VerificationRule = {
  id: 'PAYMENT_RECIPIENT_DIFFERS_FROM_AGREEMENT',
  version: RULE_VERSION,
  evaluate: (claim, context) => {
    if (claim.recipientVsAgreement === 'unknown') {
      return buildRuleItem({
        ruleId: 'PAYMENT_RECIPIENT_DIFFERS_FROM_AGREEMENT',
        category: 'payment',
        status: 'unverified',
        claim: unknownClaim,
        finding: null,
        reasonKey: 'rule.payment_recipient_differs.reason_missing',
        missingKeys: ['missing.written_agreement'],
        limitationKey: 'rule.payment_recipient_differs.limitation',
        nextActionKey: 'rule.payment_recipient_differs.next_action',
        context,
      });
    }
    if (claim.recipientVsAgreement === 'same') return null;
    return buildRuleItem({
      ruleId: 'PAYMENT_RECIPIENT_DIFFERS_FROM_AGREEMENT',
      category: 'payment',
      status: 'risk_indicator',
      claim: isBlank(claim.paymentRecipient)
        ? message('claim.recipient_differs')
        : sourceValue(maskPersonName(claim.paymentRecipient)),
      finding: message('rule.payment_recipient_differs.finding'),
      reasonKey: 'rule.payment_recipient_differs.reason',
      missingKeys: ['missing.recipient_explanation'],
      limitationKey: 'rule.payment_recipient_differs.limitation',
      nextActionKey: 'rule.payment_recipient_differs.next_action',
      context,
    });
  },
};

/** 6. The payment purpose or amount differs from the written agreement. */
export const purposeMismatchRule: VerificationRule = {
  id: 'PAYMENT_PURPOSE_DIFFERS_FROM_AGREEMENT',
  version: RULE_VERSION,
  evaluate: (claim, context) => {
    if (claim.purposeVsAgreement === 'unknown') {
      return buildRuleItem({
        ruleId: 'PAYMENT_PURPOSE_DIFFERS_FROM_AGREEMENT',
        category: 'payment',
        status: 'unverified',
        claim: unknownClaim,
        finding: null,
        reasonKey: 'rule.payment_purpose_differs.reason_missing',
        missingKeys: ['missing.written_agreement'],
        limitationKey: 'rule.payment_purpose_differs.limitation',
        nextActionKey: 'rule.payment_purpose_differs.next_action',
        context,
      });
    }
    if (claim.purposeVsAgreement === 'same') return null;
    return buildRuleItem({
      ruleId: 'PAYMENT_PURPOSE_DIFFERS_FROM_AGREEMENT',
      category: 'payment',
      status: 'risk_indicator',
      claim: isBlank(claim.paymentPurpose)
        ? message('claim.purpose_differs')
        : sourceValue(maskLongDigitRuns(claim.paymentPurpose)),
      finding: message('rule.payment_purpose_differs.finding'),
      reasonKey: 'rule.payment_purpose_differs.reason',
      missingKeys: ['missing.agreement_comparison'],
      limitationKey: 'rule.payment_purpose_differs.limitation',
      nextActionKey: 'rule.payment_purpose_differs.next_action',
      context,
    });
  },
};

/** Evaluation order is fixed only so the displayed list is stable; rules are independent. */
export const PAYMENT_RULES: readonly VerificationRule[] = [
  contactUnverifiedPaymentRule,
  personalAccountRule,
  writtenFeeBreakdownRule,
  timePressureRule,
  recipientMismatchRule,
  purposeMismatchRule,
];

export function evaluatePaymentRules(
  claim: Readonly<OfferClaim>,
  context: Readonly<RuleContext>,
): readonly EvidenceItem[] {
  return PAYMENT_RULES.map((rule) => rule.evaluate(claim, context)).filter(
    (item): item is EvidenceItem => item !== null,
  );
}
