import { describe, expect, it } from 'vitest';
import { runVerification } from '@/domain/verification/run-verification';
import { isRiskIndicator } from '@/domain/evidence/evidence-item';
import { demoOfferClaim, DEMO_FIXTURE_ID } from '@data/fixtures/demo-offer';
import { demoP3miSnapshot } from '@data/fixtures/demo-p3mi-snapshot';
import { FIXED_NOW, makeClaim, makeSnapshot } from '../helpers/rule-context';

const demoInput = {
  claim: demoOfferClaim,
  dataMode: { kind: 'demo', fixtureId: DEMO_FIXTURE_ID } as const,
  snapshot: demoP3miSnapshot,
  now: FIXED_NOW,
};

describe('demo scenario (PRD 8.1)', () => {
  const result = runVerification(demoInput);

  it('finds the company in the test dataset', () => {
    expect(result.companyItem.status).toBe('source_match');
  });

  it('keeps the contacting channel separate and unverified', () => {
    expect(result.contactItem.status).toBe('unverified');
    expect(result.contactItem.category).toBe('contact');
  });

  it('triggers exactly the four scenario indicators', () => {
    expect(result.triggeredIndicators.map((item) => item.ruleId)).toEqual([
      'PAYMENT_CONTACT_UNVERIFIED',
      'PAYMENT_PERSONAL_ACCOUNT_UNVERIFIED',
      'PAYMENT_NO_WRITTEN_FEE_BREAKDOWN',
      'TIME_PRESSURE_IMMEDIATE_TRANSFER',
    ]);
  });

  it('recommends delaying payment', () => {
    expect(result.recommendation).toBe('delay_payment');
  });

  it('leaves vacancy, contract, and visa unverified', () => {
    const byCategory = Object.fromEntries(
      result.evidenceMap.map((entry) => [entry.category, entry.status]),
    );
    expect(byCategory.vacancy).toBe('unverified');
    expect(byCategory.contract).toBe('unverified');
    expect(byCategory.visa).toBe('unverified');
  });

  it('covers all seven evidence categories', () => {
    expect(result.evidenceMap.map((entry) => entry.category)).toEqual([
      'company',
      'contact',
      'vacancy',
      'contract',
      'visa',
      'payment',
      'time_pressure',
    ]);
  });
});

describe('indicator count', () => {
  it('always equals the length of the triggered collection', () => {
    const result = runVerification(demoInput);
    expect(result.triggeredIndicators.length).toBe(
      result.items.filter(isRiskIndicator).length,
    );
  });

  it('drops to zero when nothing is triggered', () => {
    const result = runVerification({
      ...demoInput,
      claim: makeClaim({
        companyName: 'PT Karya Contoh Nusantara',
        contactHandle: '+62 21 0000 0000',
        accountType: 'company',
        writtenFeeBreakdown: 'provided',
        timePressure: 'no_deadline',
        recipientVsAgreement: 'same',
        purposeVsAgreement: 'same',
        officialChannelConfirmation: 'done',
      }),
    });
    expect(result.triggeredIndicators).toHaveLength(0);
    expect(result.recommendation).not.toBe('delay_payment');
  });
});

describe('data-mode separation', () => {
  it('refuses to read a demo dataset in a non-demo mode', () => {
    const result = runVerification({
      claim: demoOfferClaim,
      dataMode: { kind: 'source_unavailable', sourceId: 'siskop2mi-p3mi' },
      snapshot: demoP3miSnapshot,
      now: FIXED_NOW,
    });
    expect(result.companyItem.status).toBe('unverified');
    expect(result.companyItem.snapshotId).toBeNull();
  });

  it('refuses to read a production snapshot in demo mode', () => {
    const productionSnapshot = makeSnapshot({ isDemo: false, snapshotId: 'prod-1' });
    const result = runVerification({
      claim: demoOfferClaim,
      dataMode: { kind: 'demo', fixtureId: DEMO_FIXTURE_ID },
      snapshot: productionSnapshot,
      now: FIXED_NOW,
    });
    expect(result.companyItem.snapshotId).toBeNull();
  });

  it('never turns a source failure into a company match', () => {
    const result = runVerification({
      claim: demoOfferClaim,
      dataMode: { kind: 'source_unavailable', sourceId: 'siskop2mi-p3mi' },
      snapshot: null,
      now: FIXED_NOW,
    });
    expect(result.companyItem.status).not.toBe('source_match');
  });
});

describe('evidence contract', () => {
  it('gives every item the full metadata set', () => {
    const result = runVerification(demoInput);
    for (const item of result.items) {
      expect(item.id).toBeTruthy();
      expect(item.claim).toBeTruthy();
      expect(item.reason).toBeTruthy();
      expect(item.sourceName).toBeTruthy();
      expect(item.limitation).toBeTruthy();
      expect(item.nextAction).toBeTruthy();
      expect(item.checkedAt).toBe(FIXED_NOW.toISOString());
      expect(item.missingInformation.length).toBeGreaterThan(0);
    }
  });

  it('records the snapshot version on source-backed items', () => {
    const result = runVerification(demoInput);
    expect(result.companyItem.snapshotId).toBe(demoP3miSnapshot.snapshotId);
  });

  it('is reproducible for the same inputs and clock', () => {
    const first = runVerification(demoInput);
    const second = runVerification(demoInput);
    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
  });
});
