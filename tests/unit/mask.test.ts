import { describe, expect, it } from 'vitest';
import {
  maskAccountNumber,
  maskContactHandle,
  maskEmail,
  maskLongDigitRuns,
  maskPersonName,
  maskPhone,
  maskUsername,
} from '@/domain/privacy/mask';

const containsRun = (value: string, run: string) => value.includes(run);

describe('maskPhone', () => {
  it('hides the middle of an international number', () => {
    const masked = maskPhone('+886 900 111 222');
    expect(masked.startsWith('+886')).toBe(true);
    expect(masked.endsWith('22')).toBe(true);
    expect(containsRun(masked, '900111')).toBe(false);
  });

  it('hides the middle of a local number', () => {
    const masked = maskPhone('081234567890');
    expect(containsRun(masked, '1234567')).toBe(false);
    expect(masked.endsWith('90')).toBe(true);
  });

  it('handles short and malformed values without revealing them', () => {
    expect(maskPhone('12')).toBe('••');
    expect(maskPhone('')).toBe('');
    expect(maskPhone('abc')).toBe('•••');
  });
});

describe('maskEmail', () => {
  it('keeps the domain and hides the local part', () => {
    expect(maskEmail('andiwijaya@example.com')).toBe('a••••••••a@example.com');
  });

  it('masks a very short local part entirely', () => {
    expect(maskEmail('ab@example.com')).toBe('••@example.com');
  });

  it('does not reveal a malformed address', () => {
    expect(maskEmail('not-an-email')).toBe('••••••');
  });
});

describe('maskUsername', () => {
  it('keeps only the first and last character', () => {
    const masked = maskUsername('@agenluarnegeri');
    expect(masked.startsWith('@a')).toBe(true);
    expect(masked.endsWith('i')).toBe(true);
    expect(masked).not.toContain('genluarneger');
  });

  it('masks a two-character username entirely', () => {
    expect(maskUsername('ab')).toBe('@••');
  });
});

describe('maskAccountNumber', () => {
  it('keeps at most the last two digits', () => {
    const masked = maskAccountNumber('1234567890');
    expect(masked.endsWith('90')).toBe(true);
    expect(containsRun(masked, '12345678')).toBe(false);
  });

  it('masks a short account entirely', () => {
    expect(maskAccountNumber('1234')).toBe('••••');
  });
});

describe('maskPersonName', () => {
  it('reduces a full name to initials', () => {
    expect(maskPersonName('Andi Wijaya Contoh')).toBe('A. W. C.');
  });

  it('handles a single name and blank input', () => {
    expect(maskPersonName('Andi')).toBe('A.');
    expect(maskPersonName('  ')).toBe('');
  });
});

describe('maskContactHandle', () => {
  it('routes each handle type to the right masker', () => {
    expect(maskContactHandle('kantor@example.com')).toContain('@example.com');
    expect(maskContactHandle('@akun').startsWith('@')).toBe(true);
    expect(maskContactHandle('+886 900 000 111')).toContain('+886');
  });

  it('never returns the original value for a real handle', () => {
    const original = '+886900000111';
    expect(maskContactHandle(original)).not.toBe(original);
  });
});

describe('maskLongDigitRuns', () => {
  it('collapses an embedded account number inside free text', () => {
    const masked = maskLongDigitRuns('transfer ke 1234567890 sekarang');
    expect(masked).not.toContain('1234567890');
    expect(masked).toContain('transfer ke');
  });

  it('leaves short numbers alone', () => {
    expect(maskLongDigitRuns('kuota tinggal 2')).toBe('kuota tinggal 2');
  });
});
