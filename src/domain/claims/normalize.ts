/**
 * Normalization used only for comparison. The raw value is always preserved for
 * provenance and display (DATA_SOURCES.md 8, CONVENTIONS.md 10.3).
 */

const COMPANY_LEGAL_PREFIXES = ['pt', 'cv', 'ud', 'pt.', 'cv.'];

/**
 * Conservative company-name normalization: case-folded, punctuation stripped, whitespace
 * collapsed, and a leading legal form removed. It intentionally does NOT drop words,
 * transliterate, or fuzzy-stem — an aggressive normalizer would create false matches.
 */
export function normalizeCompanyName(value: string): string {
  const base = value
    .toLowerCase()
    .replace(/[.,''`"()\-/\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (base.length === 0) return '';
  const [first, ...rest] = base.split(' ');
  if (rest.length > 0 && first !== undefined && COMPANY_LEGAL_PREFIXES.includes(first)) {
    return rest.join(' ');
  }
  return base;
}

/**
 * Indonesian and international phone normalization for comparison only.
 * Returns digits in international form without `+`, or `null` when the input cannot be
 * read as a phone number. Extensions after `ext`/`#` are dropped.
 */
export function normalizePhone(value: string): string | null {
  const withoutExtension = value.split(/ext\.?|#|,/i)[0] ?? '';
  const trimmed = withoutExtension.trim();
  if (trimmed.length === 0) return null;
  const hasPlus = trimmed.startsWith('+');
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length < 6) return null;
  if (hasPlus) return digits;
  if (digits.startsWith('62')) return digits;
  if (digits.startsWith('0')) return `62${digits.slice(1)}`;
  return digits;
}

export function normalizeEmail(value: string): string | null {
  const trimmed = value.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return null;
  return trimmed;
}

export function normalizeUsername(value: string): string | null {
  const trimmed = value.trim().toLowerCase().replace(/^@/, '');
  if (trimmed.length === 0) return null;
  return trimmed;
}

export type NormalizedHandle =
  | { readonly kind: 'phone'; readonly value: string }
  | { readonly kind: 'email'; readonly value: string }
  | { readonly kind: 'username'; readonly value: string }
  | { readonly kind: 'unreadable' };

/** Classifies a contact handle so phone-to-phone comparisons are not mixed with usernames. */
export function normalizeContactHandle(value: string): NormalizedHandle {
  const trimmed = value.trim();
  if (trimmed.length === 0) return { kind: 'unreadable' };

  const email = normalizeEmail(trimmed);
  if (email) return { kind: 'email', value: email };

  const looksLikePhone = /^[+()\d][\d\s()+\-.]{5,}$/.test(trimmed);
  if (looksLikePhone) {
    const phone = normalizePhone(trimmed);
    if (phone) return { kind: 'phone', value: phone };
  }

  const username = normalizeUsername(trimmed);
  if (username) return { kind: 'username', value: username };
  return { kind: 'unreadable' };
}

/** Case-folded, whitespace-collapsed text for position/country comparison. */
export function normalizePlainText(value: string): string {
  return value.toLowerCase().replace(/\s+/g, ' ').trim();
}
