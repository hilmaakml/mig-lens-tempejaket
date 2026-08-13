import type { OfferClaim } from '@/domain/claims/offer-claim';

/**
 * SYNTHETIC DEMO OFFER — composite of reported case patterns, not a real person or offer.
 *
 * It reproduces the PRD section 8.1 happy-path scenario: company present in the test
 * dataset, contacting channel unverified, vacancy unconfirmed, no contract, no written
 * fee breakdown, payment to an unverified personal account, and same-day pressure.
 */
export const DEMO_FIXTURE_ID = 'demo-offer-caregiver-taiwan';

export const demoOfferClaim: OfferClaim = {
  companyName: 'PT Karya Contoh Nusantara',
  recruiterName: 'Bapak Andi (contoh)',
  position: 'Caregiver',
  destinationCountry: 'Taiwan',
  offerOrigin: 'WhatsApp',
  contactChannel: 'whatsapp',
  contactHandle: '+886 900 000 000',
  paymentAmount: 'Rp7.500.000',
  paymentPurpose: 'Biaya administrasi dan pemberangkatan',
  paymentRecipient: 'Andi Contoh (rekening pribadi)',
  accountType: 'personal',
  writtenFeeBreakdown: 'not_provided',
  receipt: 'not_provided',
  recipientVsAgreement: 'unknown',
  purposeVsAgreement: 'unknown',
  officialChannelConfirmation: 'not_done',
  contractStatus: 'not_provided',
  visaStatus: 'not_provided',
  visaType: '',
  timePressure: 'same_day',
  paymentDeadlineNote: 'Diminta transfer hari ini juga',
};

/** Fields the demo marks as "needs checking" on the confirmation screen. */
export const demoFieldsNeedingReview: readonly (keyof OfferClaim)[] = [
  'contactHandle',
  'accountType',
  'contractStatus',
  'visaStatus',
  'timePressure',
];
