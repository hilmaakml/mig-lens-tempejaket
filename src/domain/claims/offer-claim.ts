import { z } from 'zod';

/**
 * The confirmed offer claim (PRD FR-03, FR-04).
 *
 * Every value is user-supplied or user-corrected. Nothing here is proof of anything;
 * it only defines *what is being checked*. The object lives in memory for the active
 * flow and is never persisted (SECURITY.md 2).
 */

export const ACCOUNT_TYPES = ['personal', 'company', 'unknown'] as const;
export type AccountType = (typeof ACCOUNT_TYPES)[number];

export const DOCUMENT_STATUSES = ['provided', 'not_provided', 'unknown'] as const;
export type DocumentStatus = (typeof DOCUMENT_STATUSES)[number];

export const AGREEMENT_COMPARISONS = ['same', 'different', 'unknown'] as const;
export type AgreementComparison = (typeof AGREEMENT_COMPARISONS)[number];

export const TIME_PRESSURES = [
  'same_day',
  'within_days',
  'no_deadline',
  'unknown',
] as const;
export type TimePressure = (typeof TIME_PRESSURES)[number];

export const CONFIRMATION_STATUSES = ['done', 'not_done', 'unknown'] as const;
export type ConfirmationStatus = (typeof CONFIRMATION_STATUSES)[number];

export const CONTACT_CHANNELS = [
  'whatsapp',
  'phone',
  'sms',
  'email',
  'social',
  'unknown',
] as const;
export type ContactChannel = (typeof CONTACT_CHANNELS)[number];

/** Free-text fields are bounded so a pasted document cannot become application state. */
const shortText = z.string().trim().max(160);
const mediumText = z.string().trim().max(300);

export const offerClaimSchema = z.object({
  companyName: shortText,
  recruiterName: shortText,
  position: shortText,
  destinationCountry: shortText,
  offerOrigin: shortText,
  contactChannel: z.enum(CONTACT_CHANNELS),
  contactHandle: shortText,
  paymentAmount: shortText,
  paymentPurpose: mediumText,
  paymentRecipient: shortText,
  accountType: z.enum(ACCOUNT_TYPES),
  writtenFeeBreakdown: z.enum(DOCUMENT_STATUSES),
  receipt: z.enum(DOCUMENT_STATUSES),
  recipientVsAgreement: z.enum(AGREEMENT_COMPARISONS),
  purposeVsAgreement: z.enum(AGREEMENT_COMPARISONS),
  officialChannelConfirmation: z.enum(CONFIRMATION_STATUSES),
  contractStatus: z.enum(DOCUMENT_STATUSES),
  visaStatus: z.enum(DOCUMENT_STATUSES),
  visaType: shortText,
  timePressure: z.enum(TIME_PRESSURES),
  paymentDeadlineNote: shortText,
});

export type OfferClaim = Readonly<z.infer<typeof offerClaimSchema>>;

export const emptyOfferClaim: OfferClaim = {
  companyName: '',
  recruiterName: '',
  position: '',
  destinationCountry: '',
  offerOrigin: '',
  contactChannel: 'unknown',
  contactHandle: '',
  paymentAmount: '',
  paymentPurpose: '',
  paymentRecipient: '',
  accountType: 'unknown',
  writtenFeeBreakdown: 'unknown',
  receipt: 'unknown',
  recipientVsAgreement: 'unknown',
  purposeVsAgreement: 'unknown',
  officialChannelConfirmation: 'unknown',
  contractStatus: 'unknown',
  visaStatus: 'unknown',
  visaType: '',
  timePressure: 'unknown',
  paymentDeadlineNote: '',
};

export type OfferClaimField = keyof OfferClaim;

export const isBlank = (value: string): boolean => value.trim().length === 0;

/**
 * Parses an untrusted partial claim (OCR proposal, restored draft) into a complete claim.
 * Unknown or invalid values fall back to the empty claim rather than being guessed.
 */
export function parseOfferClaim(input: unknown): OfferClaim {
  const merged = {
    ...emptyOfferClaim,
    ...(typeof input === 'object' && input ? input : {}),
  };
  const result = offerClaimSchema.safeParse(merged);
  return result.success ? result.data : emptyOfferClaim;
}
