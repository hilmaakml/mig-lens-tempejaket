import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  ACCEPTED_EXTENSIONS,
  ACCEPTED_MIME_TYPES,
  MAX_FILE_BYTES,
  detectImageType,
  getExtension,
  validateMetadata,
} from '@/features/offer-input/file-validation';
import { extractClaimFromText } from '@/features/offer-input/extract-claim';
import {
  ALLOWED_EVENT_PROPERTIES,
  TELEMETRY_ENABLED,
  isAllowedEventName,
  sanitizeEvent,
} from '@/domain/privacy/telemetry';
import {
  LOCALE_STORAGE_KEY,
  readStoredLocale,
  writeStoredLocale,
} from '@/domain/privacy/locale-storage';
import { parseOfferClaim } from '@/domain/claims/offer-claim';

const projectRoot = join(__dirname, '..', '..');

describe('upload validation (SECURITY.md 4)', () => {
  const jpegHeader = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const pngHeader = new Uint8Array([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0,
  ]);
  const webpHeader = new Uint8Array([
    0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50,
  ]);

  it('detects supported formats from magic bytes', () => {
    expect(detectImageType(jpegHeader)).toBe('image/jpeg');
    expect(detectImageType(pngHeader)).toBe('image/png');
    expect(detectImageType(webpHeader)).toBe('image/webp');
  });

  it('rejects an unrecognised signature such as a PDF or executable', () => {
    expect(detectImageType(new Uint8Array([0x25, 0x50, 0x44, 0x46]))).toBeNull();
    expect(detectImageType(new Uint8Array([0x4d, 0x5a]))).toBeNull();
    expect(detectImageType(new Uint8Array([]))).toBeNull();
  });

  it('rejects an oversized file', () => {
    expect(
      validateMetadata({ name: 'a.jpg', size: MAX_FILE_BYTES + 1, type: 'image/jpeg' }),
    ).toBe('too_large');
  });

  it('rejects an empty file', () => {
    expect(validateMetadata({ name: 'a.jpg', size: 0, type: 'image/jpeg' })).toBe(
      'decode',
    );
  });

  it('rejects an unsupported MIME type or extension', () => {
    expect(
      validateMetadata({ name: 'offer.pdf', size: 1000, type: 'application/pdf' }),
    ).toBe('unsupported');
    expect(
      validateMetadata({ name: 'offer.svg', size: 1000, type: 'image/svg+xml' }),
    ).toBe('unsupported');
    expect(validateMetadata({ name: 'offer.exe', size: 1000, type: 'image/jpeg' })).toBe(
      'unsupported',
    );
  });

  it('accepts a well-formed image', () => {
    expect(
      validateMetadata({ name: 'offer.jpg', size: 1000, type: 'image/jpeg' }),
    ).toBeNull();
  });

  it('parses a double extension safely', () => {
    expect(getExtension('offer.jpg.exe')).toBe('exe');
  });

  it('keeps the accepted set narrow', () => {
    expect([...ACCEPTED_MIME_TYPES]).toEqual(['image/jpeg', 'image/png', 'image/webp']);
    expect([...ACCEPTED_EXTENSIONS]).toEqual(['jpg', 'jpeg', 'png', 'webp']);
  });
});

describe('OCR text is untrusted input (SECURITY.md 4)', () => {
  it('keeps an XSS payload as inert text and does not adopt it as a field', () => {
    const payload =
      '<script>alert("xss")</script> PT Contoh Aman <img src=x onerror=alert(1)>';
    const { claim } = extractClaimFromText(payload);
    expect(claim.companyName).not.toContain('<script>');
    expect(claim.contactHandle).not.toContain('onerror');
  });

  it('bounds every extracted field length', () => {
    const { claim } = extractClaimFromText(`PT ${'A'.repeat(5000)}`);
    expect(claim.companyName.length).toBeLessThanOrEqual(160);
  });

  it('proposes fields without asserting a risk status', () => {
    const { claim } = extractClaimFromText(
      'PT Contoh Uji mencari Caregiver di Taiwan, WhatsApp 081234567890, biaya Rp7.500.000 hari ini',
    );
    expect(claim.companyName).toContain('PT Contoh Uji');
    expect(claim.position).toBe('Caregiver');
    expect(claim.destinationCountry).toBe('Taiwan');
    expect(claim.contactChannel).toBe('whatsapp');
    expect(claim.paymentAmount).toContain('Rp7.500.000');
    // Time pressure is only a proposal the user confirms.
    expect(claim.timePressure).toBe('same_day');
    // The extractor never sets an account type or contract status by itself.
    expect(claim.accountType).toBe('unknown');
    expect(claim.contractStatus).toBe('unknown');
  });

  it('flags empty expected fields for review instead of inventing them', () => {
    const { claim, fieldsNeedingReview } = extractClaimFromText('teks tanpa informasi');
    expect(claim.companyName).toBe('');
    expect(fieldsNeedingReview).toContain('companyName');
  });
});

describe('claim parsing rejects malformed input', () => {
  it('falls back to the empty claim for a hostile object', () => {
    const parsed = parseOfferClaim({ accountType: 'definitely_safe', companyName: 123 });
    expect(parsed.accountType).toBe('unknown');
    expect(parsed.companyName).toBe('');
  });

  it('accepts a partial valid object', () => {
    expect(parseOfferClaim({ companyName: 'PT Contoh' }).companyName).toBe('PT Contoh');
  });
});

describe('telemetry allowlist (PRD FR-16)', () => {
  it('is disabled for the MVP', () => {
    expect(TELEMETRY_ENABLED).toBe(false);
  });

  it('drops every property that is not allowlisted', () => {
    const sanitized = sanitizeEvent({
      screenName: 'result',
      ocrText: 'isi tawaran rahasia',
      phone: '+886900000000',
      companyName: 'PT Contoh',
      fileName: 'ktp.jpg',
      ipAddress: '203.0.113.1',
      userAgent: 'Mozilla/5.0',
      correctedFieldCount: 3,
    });
    expect(sanitized).toEqual({ screenName: 'result', correctedFieldCount: 3 });
  });

  it('never allows a free-text or identifier property', () => {
    for (const forbidden of ['ocrText', 'phone', 'email', 'accountNumber', 'message']) {
      expect((ALLOWED_EVENT_PROPERTIES as readonly string[]).includes(forbidden)).toBe(
        false,
      );
    }
  });

  it('rejects an unknown event name', () => {
    expect(isAllowedEventName('screen_view')).toBe(true);
    expect(isAllowedEventName('offer_uploaded_with_text')).toBe(false);
  });
});

describe('browser storage (SECURITY.md 6)', () => {
  it('persists only a validated locale enum', () => {
    writeStoredLocale('en');
    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('en');
    expect(window.localStorage.length).toBe(1);
  });

  it('ignores a tampered stored value', () => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, '{"claim":"secret"}');
    expect(readStoredLocale()).toBeNull();
  });
});

describe('service-worker cache policy (SECURITY.md 10)', () => {
  const source = readFileSync(join(projectRoot, 'public', 'sw.js'), 'utf8');

  it('excludes every offer-flow route from caching', () => {
    for (const route of [
      '/app/periksa',
      '/app/konfirmasi',
      '/app/hasil',
      '/app/bagikan',
      '/app/pesan',
    ]) {
      expect(source).toContain(`'${route}'`);
    }
  });

  it('never pre-caches an offer-flow route', () => {
    const shellBlock = source.slice(
      source.indexOf('const SHELL_ASSETS'),
      source.indexOf('self.addEventListener'),
    );
    for (const route of [
      '/app/periksa',
      '/app/konfirmasi',
      '/app/hasil',
      '/app/bagikan',
      '/app/pesan',
    ]) {
      expect(shellBlock).not.toContain(route);
    }
  });

  it('deletes obsolete cache versions on activation', () => {
    expect(source).toContain('caches.delete');
  });
});

describe('security headers and CSP (SECURITY.md 10)', () => {
  const middleware = readFileSync(join(projectRoot, 'middleware.ts'), 'utf8');
  const nextConfig = readFileSync(join(projectRoot, 'next.config.mjs'), 'utf8');

  it('defines a nonce-based script policy without unsafe-inline scripts', () => {
    expect(middleware).toContain("script-src 'self' 'nonce-");
    expect(middleware).not.toContain("script-src 'self' 'unsafe-inline'");
  });

  it('restricts connections, frames, and objects', () => {
    expect(middleware).toContain("connect-src 'self'");
    expect(middleware).toContain("frame-ancestors 'none'");
    expect(middleware).toContain("object-src 'none'");
  });

  it('sets the baseline response headers', () => {
    expect(nextConfig).toContain('X-Content-Type-Options');
    expect(nextConfig).toContain('Strict-Transport-Security');
    expect(nextConfig).toContain('Referrer-Policy');
    expect(nextConfig).toContain('Permissions-Policy');
  });

  it('marks offer-flow responses no-store', () => {
    expect(nextConfig).toContain('no-store');
  });
});

describe('no secret or real personal data in fixtures', () => {
  const fixture = readFileSync(
    join(projectRoot, 'data', 'fixtures', 'demo-p3mi-snapshot.ts'),
    'utf8',
  );

  it('marks the dataset as demo', () => {
    expect(fixture).toContain('isDemo: true');
  });

  it('uses reserved example domains only', () => {
    const urls = fixture.match(/https?:\/\/[^\s'"]+/g) ?? [];
    for (const url of urls) {
      expect(
        url.includes('example.com') || url.includes('siskop2mi.bp2mi.go.id'),
        url,
      ).toBe(true);
    }
  });

  it('uses an obviously fictional licence identifier', () => {
    expect(fixture).toContain('CONTOH-');
  });
});
