import { describe, expect, it } from 'vitest';
import { buildComplaintChannelViews } from '@/domain/actions/complaint-channels';
import { EXERCISES, mapExercise } from '@/domain/learning/exercise-mapping';
import { runVerification } from '@/domain/verification/run-verification';
import { demoOfferClaim, DEMO_FIXTURE_ID } from '@data/fixtures/demo-offer';
import { demoP3miSnapshot } from '@data/fixtures/demo-p3mi-snapshot';
import { FIXED_NOW, makeClaim } from '../helpers/rule-context';
import { isAllowlistedUrl } from '@/domain/sources/source-registry';

const demoResult = runVerification({
  claim: demoOfferClaim,
  dataMode: { kind: 'demo', fixtureId: DEMO_FIXTURE_ID },
  snapshot: demoP3miSnapshot,
  now: FIXED_NOW,
});

describe('complaint channels (PRD FR-12)', () => {
  const views = buildComplaintChannelViews(demoResult.items);

  it('always offers every channel, so the action is never a dead end', () => {
    expect(views).toHaveLength(4);
  });

  it('recommends AduanNomor when the contact is unresolved', () => {
    const aduan = views.find((view) => view.channel.id === 'aduannomor');
    expect(aduan?.isRecommended).toBe(true);
    expect(aduan?.url).toBe('https://aduannomor.id/');
    expect(aduan?.domain).toBe('aduannomor.id');
  });

  it('recommends CekRekening when payment goes to an unverified account', () => {
    const cek = views.find((view) => view.channel.id === 'cekrekening');
    expect(cek?.isRecommended).toBe(true);
    expect(cek?.url).toBe('https://cekrekening.id/');
  });

  it('renders the KP2MI complaint channel as unavailable with an approved alternative', () => {
    const kp2mi = views.find((view) => view.channel.id === 'kp2mi-complaint');
    expect(kp2mi?.url).toBeNull();
    expect(kp2mi?.alternative?.url).toBe(
      'https://siskop2mi.bp2mi.go.id/profil/lembaga/list_lembaga/p3mi',
    );
  });

  it('only exposes allowlisted URLs', () => {
    for (const view of views) {
      if (view.url) expect(isAllowlistedUrl(view.url)).toBe(true);
      if (view.alternative?.url)
        expect(isAllowlistedUrl(view.alternative.url)).toBe(true);
    }
  });

  it('never encodes offer content in a channel URL', () => {
    for (const view of views) {
      if (!view.url) continue;
      expect(view.url).not.toContain('?');
      expect(view.url).not.toContain('#');
      expect(view.url).not.toContain(demoOfferClaim.contactHandle.replace(/\s/g, ''));
    }
  });

  it('recommends no contact or payment channel when nothing is triggered', () => {
    const clean = runVerification({
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
      dataMode: { kind: 'demo', fixtureId: DEMO_FIXTURE_ID },
      snapshot: demoP3miSnapshot,
      now: FIXED_NOW,
    });
    const cleanViews = buildComplaintChannelViews(clean.items);
    expect(cleanViews.find((v) => v.channel.id === 'aduannomor')?.isRecommended).toBe(
      false,
    );
    expect(cleanViews.find((v) => v.channel.id === 'cekrekening')?.isRecommended).toBe(
      false,
    );
  });
});

describe('personal exercise mapping (PRD FR-14)', () => {
  it('maps an unverified contact to the identity-misuse exercise first', () => {
    expect(mapExercise(demoResult.items)).toBe('institution-identity-misuse');
  });

  it('falls through to urgency when the contact is verified', () => {
    const items = demoResult.items.filter((item) => item.category !== 'contact');
    expect(mapExercise(items)).toBe('urgency-and-time-pressure');
  });

  it('falls through to written evidence when contact and urgency are resolved', () => {
    const items = demoResult.items.filter(
      (item) =>
        item.category !== 'contact' && item.ruleId !== 'TIME_PRESSURE_IMMEDIATE_TRANSFER',
    );
    expect(mapExercise(items)).toBe('asking-for-written-evidence');
  });

  it('maps a personal-account indicator when only that remains', () => {
    const items = demoResult.items.filter(
      (item) => item.ruleId === 'PAYMENT_PERSONAL_ACCOUNT_UNVERIFIED',
    );
    expect(mapExercise(items)).toBe('checking-payment-destination');
  });

  it('returns null when nothing is unresolved', () => {
    expect(mapExercise([])).toBeNull();
  });

  it('carries no progress numbers in the catalogue, so a new visitor starts at zero', () => {
    for (const exercise of EXERCISES) {
      expect(exercise).not.toHaveProperty('recognised');
      expect(exercise).not.toHaveProperty('total');
      expect(exercise.titleKey).toBeTruthy();
    }
  });
});
