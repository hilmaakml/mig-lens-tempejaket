import { describe, expect, it } from 'vitest';
import { enMessages } from '@/content/locales/en';
import { idMessages } from '@/content/locales/id';
import { LOCALES } from '@/content/locales/locale';
import { CATALOGS, formatDate, translate } from '@/content/locales/translate';
import type { MessageKey } from '@/content/locales/message-key';

const idKeys = Object.keys(idMessages).sort();
const enKeys = Object.keys(enMessages).sort();

const PLACEHOLDER = /\{(\w+)\}/g;
const placeholdersOf = (value: string) =>
  [...value.matchAll(PLACEHOLDER)].map((match) => match[1]).sort();

describe('catalog parity', () => {
  it('has exactly the same keys in both languages', () => {
    expect(enKeys).toEqual(idKeys);
  });

  it('has no empty message', () => {
    for (const locale of LOCALES) {
      for (const [key, value] of Object.entries(CATALOGS[locale])) {
        expect(value.trim(), `${locale}:${key}`).not.toBe('');
      }
    }
  });

  it('uses the same interpolation parameters in both languages', () => {
    for (const key of idKeys as MessageKey[]) {
      expect(placeholdersOf(enMessages[key]), key).toEqual(
        placeholdersOf(idMessages[key]),
      );
    }
  });

  it('uses semantic keys, never Indonesian sentences as keys', () => {
    for (const key of idKeys) {
      // Namespaced identifier segments only; `field.*` mirrors the claim field names.
      expect(key).toMatch(/^[a-z][A-Za-z0-9_]*(\.[A-Za-z0-9_]+)+$/);
      expect(key).not.toContain(' ');
    }
  });
});

describe('prohibited product claims (PRD 11.3, DATA_SOURCES.md 12)', () => {
  // Word-boundary patterns so "aman" does not match "keamanan" or "pengaman".
  const ID_FORBIDDEN: readonly RegExp[] = [
    /\btawaran (ini )?aman\b/i,
    /\bpasti penipuan\b/i,
    /\bterbukti scam\b/i,
    /\b100% akurat\b/i,
    /\bAI memastikan\b/i,
    /\bsudah kebal\b/i,
    /\btidak mungkin tertipu\b/i,
    /\bperusahaan ilegal\b/i,
    /\brekening aman\b/i,
    /\bverifikasi real-?time\b/i,
    /\bdikuasai\b/i,
  ];

  const EN_FORBIDDEN: readonly RegExp[] = [
    /\bthis offer is safe\b/i,
    /\bdefinitely (a )?(fraud|scam)\b/i,
    /\bproven scam\b/i,
    /\b100% accurate\b/i,
    /\bAI guarantees\b/i,
    /\byou are now immune\b/i,
    /\breal-?time verification\b/i,
    /\bmastered\b/i,
  ];

  /**
   * A forbidden phrase only counts as a product claim when it is asserted. The catalog
   * deliberately negates several of them ("tidak berarti rekening aman"), which is the
   * wording DATA_SOURCES.md 12 requires, so a negated sentence is not a violation.
   */
  const NEGATIONS =
    /\b(tidak|bukan|belum|jangan|never|not|no |does not|cannot|hindari)\b/i;

  const assertsClaim = (value: string, pattern: RegExp): boolean =>
    value
      .split(/(?<=[.!?])\s+/)
      .some((sentence) => pattern.test(sentence) && !NEGATIONS.test(sentence));

  it('contains no forbidden Indonesian claim', () => {
    for (const [key, value] of Object.entries(idMessages)) {
      for (const pattern of ID_FORBIDDEN) {
        expect(assertsClaim(value, pattern), `${key}: ${value}`).toBe(false);
      }
    }
  });

  it('contains no forbidden English claim', () => {
    for (const [key, value] of Object.entries(enMessages)) {
      for (const pattern of EN_FORBIDDEN) {
        expect(assertsClaim(value, pattern), `${key}: ${value}`).toBe(false);
      }
    }
  });

  it('the negation guard still catches an asserted claim', () => {
    expect(assertsClaim('Tawaran ini aman.', /\btawaran (ini )?aman\b/i)).toBe(true);
    expect(
      assertsClaim('Ini bukan berarti tawaran ini aman.', /\btawaran (ini )?aman\b/i),
    ).toBe(false);
  });

  it('uses no percentage-based immunity or accuracy score', () => {
    for (const locale of LOCALES) {
      for (const [key, value] of Object.entries(CATALOGS[locale])) {
        expect(/\d+\s?%/.test(value), `${locale}:${key}`).toBe(false);
      }
    }
  });
});

describe('canonical copy (PRD Appendix A)', () => {
  it('keeps the upload warning verbatim', () => {
    expect(idMessages['upload.privacy_warning']).toBe(
      'Jangan unggah KTP, paspor, nomor identitas, atau dokumen yang memuat data pribadi sensitif.',
    );
  });

  it('keeps the OCR review notice verbatim', () => {
    expect(idMessages['confirm.notice']).toBe(
      'Periksa kembali informasi berikut. Sistem dapat keliru membaca teks pada gambar.',
    );
  });

  it('keeps the payment recommendation verbatim', () => {
    expect(idMessages['result.recommendation.delay_payment.body']).toBe(
      'Tunda pembayaran sampai identitas penghubung, rincian biaya, dan tujuan pembayaran dapat diverifikasi melalui kanal resmi.',
    );
  });

  it('keeps the verification message verbatim', () => {
    expect(idMessages['message.body']).toBe(
      'Mohon kirimkan tautan lowongan resmi, nama dan nomor izin P3MI, draf kontrak, rincian biaya tertulis, serta kontak kantor resmi yang dapat saya hubungi untuk melakukan verifikasi.',
    );
  });

  it('keeps the complaint action label verbatim', () => {
    expect(idMessages['result.action_complaint']).toBe(
      'Laporkan tawaran atau kontak mencurigakan',
    );
  });

  it('keeps the complaint hand-off notice verbatim', () => {
    expect(idMessages['channels.handoff_notice']).toBe(
      'Anda akan membuka layanan resmi di luar MigLens. MigLens tidak mengirim laporan atau data tawaran secara otomatis. Periksa kembali informasi yang ingin Anda berikan pada layanan tersebut.',
    );
  });

  it('keeps the product limitation verbatim', () => {
    expect(idMessages['result.limitation']).toBe(
      'MigLens membantu menguraikan klaim, membandingkan bukti, dan menunjukkan informasi yang masih perlu diverifikasi. Hasil ini bukan keputusan hukum atau jaminan bahwa suatu tawaran aman maupun penipuan.',
    );
  });

  it('describes the complaint object, not "reporting an indicator"', () => {
    expect(idMessages['result.action_complaint']).not.toMatch(/indikator/i);
    expect(enMessages['result.action_complaint']).not.toMatch(/indicator/i);
  });
});

describe('status wording keeps its scope in both languages', () => {
  it('does not strengthen a scoped status', () => {
    expect(enMessages['status.source_match']).toBe('Matches the source checked');
    expect(enMessages['status.unverified']).toBe('Not yet verified');
    expect(enMessages['status.mismatch']).toBe('Does not match');
    expect(enMessages['check.company.finding_not_in_scope']).toContain('scope');
  });
});

describe('translate and formatting', () => {
  it('interpolates parameters', () => {
    expect(translate('id', 'result.indicator_count', { count: 4 })).toContain('4');
    expect(translate('en', 'result.indicator_count', { count: 4 })).toContain('4');
  });

  it('leaves an unknown placeholder visible instead of silently emptying it', () => {
    expect(translate('id', 'result.indicator_count')).toContain('{count}');
  });

  it('formats dates in the active locale using the Asia/Jakarta timezone', () => {
    const iso = '2026-08-01T20:00:00.000Z';
    // 20:00 UTC is already 2 August in Jakarta (UTC+7).
    expect(formatDate('id', iso)).toContain('2');
    expect(formatDate('id', iso)).toContain('Agustus');
    expect(formatDate('en', iso)).toContain('August');
  });

  it('renders a dash for a missing or malformed date', () => {
    expect(formatDate('id', null)).toBe('—');
    expect(formatDate('id', 'not-a-date')).toBe('—');
  });
});
