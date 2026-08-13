import { describe, expect, it } from 'vitest';
import {
  normalizeCompanyName,
  normalizeContactHandle,
  normalizeEmail,
  normalizePhone,
  normalizePlainText,
  normalizeUsername,
} from '@/domain/claims/normalize';

describe('normalizeCompanyName', () => {
  it.each([
    ['PT Karya Contoh Nusantara', 'karya contoh nusantara'],
    ['pt. Karya Contoh Nusantara', 'karya contoh nusantara'],
    ['  PT   KARYA  CONTOH  NUSANTARA ', 'karya contoh nusantara'],
    ['CV Contoh Jaya', 'contoh jaya'],
    ['Karya Contoh Nusantara', 'karya contoh nusantara'],
  ])('normalizes %s', (input, expected) => {
    expect(normalizeCompanyName(input)).toBe(expected);
  });

  it('keeps distinct companies distinct', () => {
    expect(normalizeCompanyName('PT Contoh Satu')).not.toBe(
      normalizeCompanyName('PT Contoh Dua'),
    );
  });

  it('does not strip a legal prefix that is the whole name', () => {
    expect(normalizeCompanyName('PT')).toBe('pt');
  });

  it('returns an empty string for blank input', () => {
    expect(normalizeCompanyName('   ')).toBe('');
  });
});

describe('normalizePhone', () => {
  it.each([
    ['081234567890', '6281234567890'],
    ['+62 812-3456-7890', '6281234567890'],
    ['62 812 3456 7890', '6281234567890'],
    ['(021) 0000 0000', '622100000000'],
    ['+886 900 000 000', '886900000000'],
  ])('normalizes %s', (input, expected) => {
    expect(normalizePhone(input)).toBe(expected);
  });

  it('drops an extension before comparing', () => {
    expect(normalizePhone('021 0000 0000 ext. 12')).toBe(normalizePhone('021 0000 0000'));
  });

  it('returns null for values too short to be a phone number', () => {
    expect(normalizePhone('12345')).toBeNull();
    expect(normalizePhone('')).toBeNull();
    expect(normalizePhone('not a phone')).toBeNull();
  });
});

describe('normalizeEmail and normalizeUsername', () => {
  it('normalizes a valid email', () => {
    expect(normalizeEmail('  Kantor@Example.COM ')).toBe('kantor@example.com');
  });

  it('rejects a malformed email', () => {
    expect(normalizeEmail('kantor@')).toBeNull();
    expect(normalizeEmail('kantor')).toBeNull();
  });

  it('strips a leading @ from a username', () => {
    expect(normalizeUsername('@Contoh_Akun')).toBe('contoh_akun');
  });
});

describe('normalizeContactHandle', () => {
  it('classifies a phone number', () => {
    expect(normalizeContactHandle('+62 812-3456-7890')).toEqual({
      kind: 'phone',
      value: '6281234567890',
    });
  });

  it('classifies an email', () => {
    expect(normalizeContactHandle('Kantor@example.com')).toEqual({
      kind: 'email',
      value: 'kantor@example.com',
    });
  });

  it('classifies a social username', () => {
    expect(normalizeContactHandle('@agenluarnegeri')).toEqual({
      kind: 'username',
      value: 'agenluarnegeri',
    });
  });

  it('reports unreadable input rather than guessing', () => {
    expect(normalizeContactHandle('   ')).toEqual({ kind: 'unreadable' });
  });

  it('never treats a phone and a username as the same handle', () => {
    const phone = normalizeContactHandle('+628123456789');
    const username = normalizeContactHandle('628123456789x');
    expect(phone.kind).not.toBe(username.kind);
  });
});

describe('normalizePlainText', () => {
  it('collapses whitespace and case', () => {
    expect(normalizePlainText('  Care   Giver ')).toBe('care giver');
  });
});
