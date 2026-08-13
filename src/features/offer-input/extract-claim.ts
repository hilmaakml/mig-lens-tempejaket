import {
  emptyOfferClaim,
  type ContactChannel,
  type OfferClaim,
} from '@/domain/claims/offer-claim';

/**
 * Turns raw OCR text into *proposed* claim values (PRD FR-03).
 *
 * This is deliberately shallow pattern matching, not inference: it proposes what it can
 * read and leaves everything else empty so the confirmation screen shows the gap. Nothing
 * here decides risk, and every proposed field is editable before any rule runs.
 *
 * OCR text is untrusted input. It is only ever assigned to string state and rendered as
 * text — never as HTML, never as a URL, never as a storage key.
 */

export interface ExtractionResult {
  readonly claim: OfferClaim;
  readonly fieldsNeedingReview: readonly (keyof OfferClaim)[];
}

const MAX_FIELD_LENGTH = 160;

const clean = (value: string): string =>
  value.replace(/\s+/g, ' ').trim().slice(0, MAX_FIELD_LENGTH);

// Stops at the first lowercase word so a sentence is not swallowed into the company name.
const COMPANY_PATTERN = /\b((?:PT|CV|UD)\.?(?:\s+[A-Z][A-Za-z.'-]{1,20}){1,4})/;
const PHONE_PATTERN = /(\+?\d[\d\s().-]{7,20}\d)/;
const EMAIL_PATTERN = /([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/;
const AMOUNT_PATTERN = /((?:Rp|IDR)\s?\.?\s?\d{1,3}(?:[.,]\d{3})+(?:[.,]\d{1,2})?)/i;
const COUNTRY_NAMES = [
  'Taiwan',
  'Malaysia',
  'Singapura',
  'Singapore',
  'Hong Kong',
  'Hongkong',
  'Jepang',
  'Japan',
  'Korea',
  'Arab Saudi',
  'Saudi Arabia',
  'Uni Emirat Arab',
  'Brunei',
  'Polandia',
  'Poland',
  'Jerman',
  'Germany',
];
const POSITION_NAMES = [
  'Caregiver',
  'Perawat',
  'Pengasuh',
  'ART',
  'Asisten Rumah Tangga',
  'Operator Produksi',
  'Buruh Pabrik',
  'Pekerja Pabrik',
  'Konstruksi',
  'Welder',
  'Nelayan',
  'Perkebunan',
  'Housekeeping',
  'Cleaning Service',
];

function findFirst(text: string, needles: readonly string[]): string {
  const lower = text.toLowerCase();
  for (const needle of needles) {
    if (lower.includes(needle.toLowerCase())) return needle;
  }
  return '';
}

function detectChannel(text: string): ContactChannel {
  const lower = text.toLowerCase();
  if (lower.includes('whatsapp') || lower.includes(' wa ') || lower.includes('wa:')) {
    return 'whatsapp';
  }
  if (EMAIL_PATTERN.test(text)) return 'email';
  if (
    lower.includes('telegram') ||
    lower.includes('facebook') ||
    lower.includes('instagram') ||
    lower.includes('tiktok')
  ) {
    return 'social';
  }
  if (PHONE_PATTERN.test(text)) return 'phone';
  return 'unknown';
}

const URGENCY_MARKERS = [
  'hari ini',
  'sekarang juga',
  'segera',
  'hangus',
  'kuota tinggal',
  'today',
  'right now',
];

export function extractClaimFromText(rawText: string): ExtractionResult {
  const text = rawText.slice(0, 20000);

  const company = clean(COMPANY_PATTERN.exec(text)?.[1] ?? '');
  const email = EMAIL_PATTERN.exec(text)?.[1] ?? '';
  const phone = PHONE_PATTERN.exec(text)?.[1] ?? '';
  const amount = clean(AMOUNT_PATTERN.exec(text)?.[1] ?? '');
  const country = findFirst(text, COUNTRY_NAMES);
  const position = findFirst(text, POSITION_NAMES);
  const channel = detectChannel(text);
  const handle = clean(channel === 'email' ? email : phone);
  const hasUrgency = URGENCY_MARKERS.some((marker) =>
    text.toLowerCase().includes(marker.toLowerCase()),
  );

  const claim: OfferClaim = {
    ...emptyOfferClaim,
    companyName: company,
    position,
    destinationCountry: country,
    contactChannel: channel,
    contactHandle: handle,
    paymentAmount: amount,
    // Time pressure is only proposed, never asserted: the user confirms it.
    timePressure: hasUrgency ? 'same_day' : 'unknown',
  };

  // Fields the reviewer should look at first: proposed-but-uncertain, or expected but empty.
  const needsReview: (keyof OfferClaim)[] = [];
  if (handle) needsReview.push('contactHandle');
  if (hasUrgency) needsReview.push('timePressure');
  if (!company) needsReview.push('companyName');
  if (!position) needsReview.push('position');
  if (!country) needsReview.push('destinationCountry');
  if (!amount) needsReview.push('paymentAmount');
  needsReview.push('accountType', 'contractStatus');

  return { claim, fieldsNeedingReview: needsReview };
}
