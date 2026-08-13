/**
 * Masking happens in the view model, before a value reaches a component, the
 * accessibility tree, the clipboard, or an export (SECURITY.md 7, CONVENTIONS.md 11.4).
 * These functions are pure and must tolerate short, malformed, and empty input.
 */

const BULLET = '•';

/** Keeps a country/operator prefix and the last two digits: `+886 9•• ••• •• 12`. */
export function maskPhone(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length === 0) return '';
  const hasPlus = trimmed.startsWith('+');
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length === 0) return BULLET.repeat(3);
  if (digits.length <= 4) return `${hasPlus ? '+' : ''}${BULLET.repeat(digits.length)}`;

  const prefixLength = hasPlus ? Math.min(3, digits.length - 4) : 2;
  const prefix = digits.slice(0, prefixLength);
  const suffix = digits.slice(-2);
  const hiddenCount = Math.max(1, digits.length - prefixLength - 2);
  return `${hasPlus ? '+' : ''}${prefix} ${BULLET.repeat(hiddenCount)} ${suffix}`;
}

/** `andi@example.com` -> `a••i@example.com`; the domain is kept, the local part is not. */
export function maskEmail(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length === 0) return '';
  const atIndex = trimmed.lastIndexOf('@');
  if (atIndex <= 0 || atIndex === trimmed.length - 1) {
    return BULLET.repeat(Math.min(6, Math.max(3, trimmed.length)));
  }
  const local = trimmed.slice(0, atIndex);
  const domain = trimmed.slice(atIndex + 1);
  if (local.length <= 2) return `${BULLET.repeat(local.length)}@${domain}`;
  return `${local[0]}${BULLET.repeat(Math.max(1, local.length - 2))}${local.at(-1)}@${domain}`;
}

export function maskUsername(value: string): string {
  const trimmed = value.trim().replace(/^@/, '');
  if (trimmed.length === 0) return '';
  if (trimmed.length <= 2) return `@${BULLET.repeat(trimmed.length)}`;
  return `@${trimmed[0]}${BULLET.repeat(Math.max(1, trimmed.length - 2))}${trimmed.at(-1)}`;
}

/** Account and e-wallet numbers keep at most the last two digits. */
export function maskAccountNumber(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length === 0) return '';
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length === 0) return BULLET.repeat(4);
  if (digits.length <= 4) return BULLET.repeat(digits.length);
  return `${BULLET.repeat(Math.max(3, digits.length - 2))}${digits.slice(-2)}`;
}

/** `Andi Wijaya` -> `A. W.`; a full personal name never leaves the device. */
export function maskPersonName(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length === 0) return '';
  const parts = trimmed.split(/\s+/).filter((part) => part.length > 0);
  return parts
    .map((part) => {
      const letter = part.replace(/[^\p{L}\p{N}]/gu, '')[0];
      return letter ? `${letter.toUpperCase()}.` : BULLET;
    })
    .join(' ');
}

/**
 * Masks a contact handle without knowing its type in advance. Any value that cannot be
 * classified is replaced entirely rather than partially revealed.
 */
export function maskContactHandle(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length === 0) return '';
  if (trimmed.includes('@') && !trimmed.startsWith('@')) return maskEmail(trimmed);
  if (trimmed.startsWith('@')) return maskUsername(trimmed);
  if (/\d/.test(trimmed)) return maskPhone(trimmed);
  return maskUsername(trimmed);
}

/** Any digit run of 6+ characters (account, ID, passport) is collapsed. */
export function maskLongDigitRuns(value: string): string {
  return value.replace(/\d[\d\s.-]{5,}\d/g, (match) => maskAccountNumber(match));
}
