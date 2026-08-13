import { describe, expect, it } from 'vitest';
import {
  contactUnverifiedPaymentRule,
  evaluatePaymentRules,
  personalAccountRule,
  purposeMismatchRule,
  recipientMismatchRule,
  timePressureRule,
  writtenFeeBreakdownRule,
  PAYMENT_RULES,
} from '@/domain/rules/payment-rules';
import { makeClaim, makeContext } from '../helpers/rule-context';

describe('rule metadata', () => {
  it('gives every rule a stable id and version', () => {
    for (const rule of PAYMENT_RULES) {
      expect(rule.id).toMatch(/^[A-Z_]+$/);
      expect(rule.version).toMatch(/^\d+\.\d+\.\d+$/);
    }
  });

  it('stamps the rule id and version onto every emitted item', () => {
    const items = evaluatePaymentRules(
      makeClaim({ accountType: 'personal', contactHandle: '+886900000000' }),
      makeContext(),
    );
    expect(items.length).toBeGreaterThan(0);
    for (const item of items) {
      expect(item.ruleId).toBeTruthy();
      expect(item.ruleVersion).toBeTruthy();
      expect(item.method).toBe('rule_based');
      expect(item.sourceTier).toBe('user_provided');
    }
  });
});

describe('PAYMENT_CONTACT_UNVERIFIED', () => {
  it('triggers when a handle exists and the contact is not verified', () => {
    const item = contactUnverifiedPaymentRule.evaluate(
      makeClaim({ contactHandle: '+886900000000' }),
      makeContext({ isContactVerified: false }),
    );
    expect(item?.status).toBe('risk_indicator');
  });

  it('does not trigger when the contact matched an official listing', () => {
    const item = contactUnverifiedPaymentRule.evaluate(
      makeClaim({ contactHandle: '+886900000000' }),
      makeContext({ isContactVerified: true }),
    );
    expect(item).toBeNull();
  });

  it('returns unverified — not a match — when the handle is missing', () => {
    const item = contactUnverifiedPaymentRule.evaluate(makeClaim(), makeContext());
    expect(item?.status).toBe('unverified');
    expect(item?.missingInformation.length).toBeGreaterThan(0);
  });
});

describe('PAYMENT_PERSONAL_ACCOUNT_UNVERIFIED', () => {
  it('triggers for an unverified personal account', () => {
    const item = personalAccountRule.evaluate(
      makeClaim({ accountType: 'personal' }),
      makeContext(),
    );
    expect(item?.status).toBe('risk_indicator');
  });

  it('does not trigger for a company account', () => {
    expect(
      personalAccountRule.evaluate(makeClaim({ accountType: 'company' }), makeContext()),
    ).toBeNull();
  });

  it('does not trigger when the contact is verified and confirmed officially', () => {
    const item = personalAccountRule.evaluate(
      makeClaim({ accountType: 'personal', officialChannelConfirmation: 'done' }),
      makeContext({ isContactVerified: true }),
    );
    expect(item).toBeNull();
  });

  it('returns unverified when the account type is unknown', () => {
    expect(
      personalAccountRule.evaluate(makeClaim({ accountType: 'unknown' }), makeContext())
        ?.status,
    ).toBe('unverified');
  });
});

describe('PAYMENT_NO_WRITTEN_FEE_BREAKDOWN', () => {
  it('triggers when no breakdown was provided', () => {
    expect(
      writtenFeeBreakdownRule.evaluate(
        makeClaim({ writtenFeeBreakdown: 'not_provided' }),
        makeContext(),
      )?.status,
    ).toBe('risk_indicator');
  });

  it('does not trigger when a breakdown exists', () => {
    expect(
      writtenFeeBreakdownRule.evaluate(
        makeClaim({ writtenFeeBreakdown: 'provided' }),
        makeContext(),
      ),
    ).toBeNull();
  });

  it('cites the reviewed fee regulation as its source URL', () => {
    const item = writtenFeeBreakdownRule.evaluate(
      makeClaim({ writtenFeeBreakdown: 'not_provided' }),
      makeContext(),
    );
    expect(item?.sourceUrl).toContain('jdih.bp2mi.go.id');
  });

  it('does not claim that fees are always forbidden', () => {
    const item = writtenFeeBreakdownRule.evaluate(
      makeClaim({ writtenFeeBreakdown: 'not_provided' }),
      makeContext(),
    );
    expect(item?.limitation.kind).toBe('message');
  });
});

describe('TIME_PRESSURE_IMMEDIATE_TRANSFER', () => {
  it('triggers only for same-day pressure', () => {
    expect(
      timePressureRule.evaluate(makeClaim({ timePressure: 'same_day' }), makeContext())
        ?.status,
    ).toBe('risk_indicator');
    expect(
      timePressureRule.evaluate(
        makeClaim({ timePressure: 'within_days' }),
        makeContext(),
      ),
    ).toBeNull();
    expect(
      timePressureRule.evaluate(
        makeClaim({ timePressure: 'no_deadline' }),
        makeContext(),
      ),
    ).toBeNull();
  });

  it('belongs to the time_pressure category', () => {
    const item = timePressureRule.evaluate(
      makeClaim({ timePressure: 'same_day' }),
      makeContext(),
    );
    expect(item?.category).toBe('time_pressure');
  });

  it('returns unverified when the deadline is unknown', () => {
    expect(
      timePressureRule.evaluate(makeClaim({ timePressure: 'unknown' }), makeContext())
        ?.status,
    ).toBe('unverified');
  });
});

describe('agreement comparison rules', () => {
  it('triggers when the recipient differs from the agreement', () => {
    expect(
      recipientMismatchRule.evaluate(
        makeClaim({ recipientVsAgreement: 'different' }),
        makeContext(),
      )?.status,
    ).toBe('risk_indicator');
  });

  it('stays silent when the recipient matches', () => {
    expect(
      recipientMismatchRule.evaluate(
        makeClaim({ recipientVsAgreement: 'same' }),
        makeContext(),
      ),
    ).toBeNull();
  });

  it('reports unverified when there is no written agreement to compare', () => {
    expect(
      purposeMismatchRule.evaluate(
        makeClaim({ purposeVsAgreement: 'unknown' }),
        makeContext(),
      )?.status,
    ).toBe('unverified');
  });

  it('triggers when the purpose differs', () => {
    expect(
      purposeMismatchRule.evaluate(
        makeClaim({ purposeVsAgreement: 'different' }),
        makeContext(),
      )?.status,
    ).toBe('risk_indicator');
  });
});

describe('rule determinism', () => {
  it('produces identical output for identical input', () => {
    const claim = makeClaim({ accountType: 'personal', timePressure: 'same_day' });
    const first = evaluatePaymentRules(claim, makeContext());
    const second = evaluatePaymentRules(claim, makeContext());
    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
  });

  it('is unaffected by unrelated claim fields', () => {
    const base = makeClaim({ accountType: 'personal' });
    const withNoise = makeClaim({
      accountType: 'personal',
      recruiterName: 'Contoh Nama',
    });
    expect(evaluatePaymentRules(base, makeContext()).map((i) => i.ruleId)).toEqual(
      evaluatePaymentRules(withNoise, makeContext()).map((i) => i.ruleId),
    );
  });
});
