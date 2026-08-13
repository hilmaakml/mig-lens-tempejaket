import { describe, expect, it } from 'vitest';
import { buildShareSummary } from '@/domain/privacy/share-summary';
import { renderShareText } from '@/features/actions/share-text';
import { runVerification } from '@/domain/verification/run-verification';
import { demoOfferClaim, DEMO_FIXTURE_ID } from '@data/fixtures/demo-offer';
import { demoP3miSnapshot } from '@data/fixtures/demo-p3mi-snapshot';
import { FIXED_NOW } from '../helpers/rule-context';

const claim = {
  ...demoOfferClaim,
  recruiterName: 'Andi Wijaya Contoh',
  paymentRecipient: 'Andi Wijaya Contoh',
  contactHandle: '+886900111222',
  paymentPurpose: 'Transfer ke rekening 1234567890 hari ini',
};

const result = runVerification({
  claim,
  dataMode: { kind: 'demo', fixtureId: DEMO_FIXTURE_ID },
  snapshot: demoP3miSnapshot,
  now: FIXED_NOW,
});

const summary = buildShareSummary(claim, result);
const idText = renderShareText('id', summary);
const enText = renderShareText('en', summary);

describe('redacted share summary (PRD FR-13)', () => {
  it('exposes only the allowlisted fields', () => {
    expect(Object.keys(summary).sort()).toEqual(
      [
        'categories',
        'checkedAt',
        'destinationCountry',
        'indicatorCount',
        'isDemo',
        'maskedContact',
        'position',
        'recommendation',
        'sources',
      ].sort(),
    );
  });

  it('never includes the full contact handle', () => {
    expect(summary.maskedContact).not.toBe(claim.contactHandle);
    expect(idText).not.toContain('886900111222');
    expect(enText).not.toContain('886900111222');
  });

  it('never includes the company name, recruiter name, or recipient name', () => {
    for (const text of [idText, enText]) {
      expect(text).not.toContain(claim.companyName);
      expect(text).not.toContain('Andi Wijaya Contoh');
      expect(text).not.toContain('Wijaya');
    }
  });

  it('never includes free-text payment purpose or an account number', () => {
    for (const text of [idText, enText]) {
      expect(text).not.toContain('1234567890');
      expect(text).not.toContain('Transfer ke rekening');
    }
  });

  it('carries the evidence categories, statuses, and indicator count', () => {
    expect(summary.categories).toHaveLength(7);
    expect(summary.indicatorCount).toBe(result.triggeredIndicators.length);
    expect(idText).toContain(String(result.triggeredIndicators.length));
  });

  it('always carries the limitation notice', () => {
    expect(idText).toContain('bukan keputusan hukum');
    expect(enText).toContain('not a legal decision');
  });

  it('labels a demo result', () => {
    expect(summary.isDemo).toBe(true);
    expect(idText).toContain('Contoh hasil prototipe');
  });

  it('masks a digit run inside a short claim descriptor', () => {
    const noisy = buildShareSummary(
      { ...claim, position: 'Caregiver 1234567890' },
      result,
    );
    expect(noisy.position).not.toContain('1234567890');
  });

  it('drops a blank descriptor rather than printing an empty line', () => {
    const blank = buildShareSummary(
      { ...claim, position: '', destinationCountry: '' },
      result,
    );
    expect(blank.position).toBeNull();
    expect(blank.destinationCountry).toBeNull();
  });

  it('only lists approved source URLs', () => {
    for (const source of summary.sources) {
      expect(source.url === null || source.url.startsWith('https://')).toBe(true);
    }
  });

  it('produces the same semantics in both languages', () => {
    const idLines = idText.split('\n').length;
    const enLines = enText.split('\n').length;
    expect(idLines).toBe(enLines);
  });
});
