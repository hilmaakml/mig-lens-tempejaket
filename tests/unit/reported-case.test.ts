import { describe, expect, it } from 'vitest';
import {
  CASE_LESSON_KEYS,
  CASE_SOURCE_DOMAIN,
  CASE_SOURCE_URL,
  CASE_TIMELINE,
} from '@/features/case/reported-case';
import { idMessages } from '@/content/locales/id';
import { enMessages } from '@/content/locales/en';

/**
 * This screen names a real person and draws on published reporting, so PRD 11.3 applies:
 * the account must be attributable, must not be softened into something the source does
 * not say, and must not present an illustration as a photograph of that person.
 */
describe('provenance', () => {
  it('links to the published article over HTTPS', () => {
    expect(CASE_SOURCE_URL.startsWith('https://www.detik.com/')).toBe(true);
    expect(new URL(CASE_SOURCE_URL).hostname).toBe('www.detik.com');
  });

  it('shows the destination domain it claims to open', () => {
    expect(new URL(CASE_SOURCE_URL).hostname).toContain(CASE_SOURCE_DOMAIN);
  });

  it('names the publication in both languages', () => {
    expect(idMessages['scenario.notice']).toContain('detikJogja');
    expect(enMessages['scenario.notice']).toContain('detikJogja');
    expect(idMessages['scenario.quote_attribution']).toContain('detikJogja');
    expect(enMessages['scenario.quote_attribution']).toContain('detikJogja');
  });

  it('attributes the timeline to the reporting rather than to a MigLens check', () => {
    expect(idMessages['scenario.timeline']).toMatch(/menurut pemberitaan/i);
    expect(enMessages['scenario.timeline']).toMatch(/according to the reporting/i);
  });
});

describe('the account matches the source', () => {
  const id = CASE_TIMELINE.map((step) => idMessages[step.bodyKey]).join(' ');
  const en = CASE_TIMELINE.map((step) => enMessages[step.bodyKey]).join(' ');

  it('has one entry per reported stage', () => {
    expect(CASE_TIMELINE).toHaveLength(4);
  });

  it.each([
    ['the original offer', /operator pabrik/i, /factory operator/i],
    ['the changed offer', /Thailand/, /Thailand/],
    ['the fee actually paid', /Rp25 juta/, /Rp25 million/],
    ['the document used', /paspor kunjungan/i, /visitor passport/i],
  ])('states %s', (_label, idPattern, enPattern) => {
    expect(id).toMatch(idPattern);
    expect(en).toMatch(enPattern);
  });

  it('states the real destination rather than the promised one', () => {
    // The offer said Thailand; the reporting says he was taken to Cambodia. Omitting that
    // would misrepresent a named person's case.
    expect(id).toMatch(/Kamboja/);
    expect(en).toMatch(/Cambodia/);
  });

  it('states the forced work and the escape, not a neutral "returned home"', () => {
    expect(id).toMatch(/penipu daring/i);
    expect(id).toMatch(/kabur/i);
    expect(en).toMatch(/online scammer/i);
    expect(en).toMatch(/escaped/i);
  });

  it('keeps the reported dates', () => {
    expect(id).toMatch(/November 2025/);
    expect(idMessages['scenario.step1.date']).toMatch(/Agustus 2024/);
    expect(enMessages['scenario.step1.date']).toMatch(/August 2024/);
  });
});

describe('the quotation', () => {
  it('is identical in both languages, because a quote is not translated', () => {
    expect(enMessages['scenario.quote']).toBe(idMessages['scenario.quote']);
  });

  it('reproduces the words the article attributes to him', () => {
    expect(idMessages['scenario.quote']).toBe(
      'Yang pertama itu harus jelas dulu dari PT ataupun lembaganya. Dicari tahu dulu.',
    );
  });
});

describe('the photograph', () => {
  it('is labelled as an illustration in both languages', () => {
    expect(idMessages['scenario.photo_caption']).toMatch(/ilustrasi/i);
    expect(idMessages['scenario.photo_caption']).toMatch(/bukan foto narasumber/i);
    expect(enMessages['scenario.photo_caption']).toMatch(/illustration/i);
    expect(enMessages['scenario.photo_caption']).toMatch(/not a photograph/i);
  });

  it('is flagged as an illustration on the home card too', () => {
    expect(idMessages['home.scenario.note']).toMatch(/ilustrasi/i);
    expect(enMessages['home.scenario.note']).toMatch(/illustration/i);
  });
});

describe('framing', () => {
  it('no longer calls the case a composite or claims it is not a real person', () => {
    for (const catalog of [idMessages, enMessages]) {
      for (const [key, value] of Object.entries(catalog)) {
        if (!key.startsWith('scenario.') && !key.startsWith('home.scenario.')) continue;
        expect(/komposit/i.test(value), key).toBe(false);
        expect(/composite/i.test(value), key).toBe(false);
        expect(/bukan individu nyata/i.test(value), key).toBe(false);
        expect(/not a real individual/i.test(value), key).toBe(false);
      }
    }
  });

  it('draws lessons about what the checker examines', () => {
    expect(CASE_LESSON_KEYS).toHaveLength(3);
    const lessons = CASE_LESSON_KEYS.map((key) => idMessages[key]).join(' ');
    expect(lessons).toMatch(/visa/i);
    expect(lessons).toMatch(/tertulis/i);
  });

  it('makes no verdict about any company or person', () => {
    for (const key of CASE_LESSON_KEYS) {
      for (const catalog of [idMessages, enMessages]) {
        expect(/\bpenipu\b/i.test(catalog[key]), key).toBe(false);
        expect(/\bfraudster\b/i.test(catalog[key]), key).toBe(false);
      }
    }
  });
});
