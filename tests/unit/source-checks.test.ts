import { describe, expect, it } from 'vitest';
import {
  checkCompany,
  checkContact,
  checkContract,
  checkVacancy,
  checkVisa,
} from '@/domain/verification/source-checks';
import { makeClaim, makeContext, makeSnapshot } from '../helpers/rule-context';

describe('checkCompany', () => {
  it('reports unverified when no dataset is available, not "not found"', () => {
    const { item } = checkCompany(
      makeClaim({ companyName: 'PT Karya Contoh Nusantara' }),
      makeContext({ snapshot: null }),
    );
    expect(item.status).toBe('unverified');
    expect(item.reason).toEqual({
      kind: 'message',
      key: 'check.company.reason_source_unavailable',
    });
    expect(item.snapshotId).toBeNull();
  });

  it('distinguishes "not found in scope" from "source unavailable"', () => {
    const { item } = checkCompany(
      makeClaim({ companyName: 'PT Nama Yang Tidak Ada' }),
      makeContext({ snapshot: makeSnapshot(), snapshotFreshness: 'fresh' }),
    );
    expect(item.status).toBe('unverified');
    expect(item.reason).toEqual({
      kind: 'message',
      key: 'check.company.reason_not_found',
    });
    expect(item.snapshotId).toBe('test-snapshot-1');
  });

  it('matches a record after conservative normalization', () => {
    const { item, matchedRecord } = checkCompany(
      makeClaim({ companyName: 'pt karya contoh nusantara' }),
      makeContext({ snapshot: makeSnapshot(), snapshotFreshness: 'fresh' }),
    );
    expect(item.status).toBe('source_match');
    expect(item.method).toBe('normalized');
    expect(item.retrievedAt).toBe('2026-08-10T00:00:00.000Z');
    expect(matchedRecord?.officialName).toBe('PT Karya Contoh Nusantara');
  });

  it('downgrades a match from a stale dataset to unverified', () => {
    const { item } = checkCompany(
      makeClaim({ companyName: 'PT Karya Contoh Nusantara' }),
      makeContext({ snapshot: makeSnapshot(), snapshotFreshness: 'stale' }),
    );
    expect(item.status).toBe('unverified');
    expect(item.reason).toEqual({ kind: 'message', key: 'check.company.reason_stale' });
  });

  it('returns unverified when the company name is missing', () => {
    const { item } = checkCompany(makeClaim(), makeContext());
    expect(item.status).toBe('unverified');
    expect(item.sourceTier).toBe('user_provided');
  });

  it('keeps the raw claim value verbatim for provenance', () => {
    const { item } = checkCompany(
      makeClaim({ companyName: '  PT Karya Contoh Nusantara ' }),
      makeContext({ snapshot: makeSnapshot(), snapshotFreshness: 'fresh' }),
    );
    expect(item.claim).toEqual({ kind: 'source', value: '  PT Karya Contoh Nusantara ' });
  });
});

describe('checkContact', () => {
  const snapshot = makeSnapshot();
  const record = snapshot.p3miRecords[0]!;

  it('matches a handle listed as an official contact', () => {
    const { item, isVerified } = checkContact(
      makeClaim({ contactHandle: '02100000000' }),
      makeContext({ snapshot, snapshotFreshness: 'fresh' }),
      record,
    );
    expect(item.status).toBe('source_match');
    expect(isVerified).toBe(true);
  });

  it('stays unverified for an unlisted handle when the list is not complete', () => {
    const { item, isVerified } = checkContact(
      makeClaim({ contactHandle: '+886900000000' }),
      makeContext({ snapshot, snapshotFreshness: 'fresh' }),
      record,
    );
    expect(item.status).toBe('unverified');
    expect(isVerified).toBe(false);
  });

  it('reports a mismatch only when the source guarantees a complete contact list', () => {
    const completeSnapshot = makeSnapshot({
      p3miRecords: [{ ...record, isContactListComplete: true }],
    });
    const { item } = checkContact(
      makeClaim({ contactHandle: '+886900000000' }),
      makeContext({ snapshot: completeSnapshot, snapshotFreshness: 'fresh' }),
      completeSnapshot.p3miRecords[0]!,
    );
    expect(item.status).toBe('mismatch');
  });

  it('never inherits the company status when no record matched', () => {
    const { item, isVerified } = checkContact(
      makeClaim({ contactHandle: '+886900000000' }),
      makeContext({ snapshot, snapshotFreshness: 'fresh' }),
      null,
    );
    expect(item.status).toBe('unverified');
    expect(isVerified).toBe(false);
  });

  it('does not compare a username against a listed phone number', () => {
    const { item } = checkContact(
      makeClaim({ contactHandle: '@akuncontoh' }),
      makeContext({ snapshot, snapshotFreshness: 'fresh' }),
      record,
    );
    expect(item.status).toBe('unverified');
  });

  it('returns unverified for unreadable input', () => {
    const { item } = checkContact(makeClaim(), makeContext(), record);
    expect(item.status).toBe('unverified');
    expect(item.sourceTier).toBe('user_provided');
  });
});

describe('checkVacancy', () => {
  const vacancySnapshot = makeSnapshot({
    vacancyRecords: [
      {
        recordId: 'v1',
        companyName: 'PT Karya Contoh Nusantara',
        position: 'Caregiver',
        destinationCountry: 'Hong Kong',
      },
    ],
  });

  it('matches an exact position and country', () => {
    const item = checkVacancy(
      makeClaim({
        companyName: 'PT Karya Contoh Nusantara',
        position: 'Caregiver',
        destinationCountry: 'Hong Kong',
      }),
      makeContext({ snapshot: vacancySnapshot, snapshotFreshness: 'fresh' }),
    );
    expect(item.status).toBe('source_match');
  });

  it('reports a mismatch when the same position lists a different country', () => {
    const item = checkVacancy(
      makeClaim({
        companyName: 'PT Karya Contoh Nusantara',
        position: 'Caregiver',
        destinationCountry: 'Taiwan',
      }),
      makeContext({ snapshot: vacancySnapshot, snapshotFreshness: 'fresh' }),
    );
    expect(item.status).toBe('mismatch');
  });

  it('reports unverified — never fake — when nothing matches', () => {
    const item = checkVacancy(
      makeClaim({
        companyName: 'PT Karya Contoh Nusantara',
        position: 'Welder',
        destinationCountry: 'Taiwan',
      }),
      makeContext({ snapshot: vacancySnapshot, snapshotFreshness: 'fresh' }),
    );
    expect(item.status).toBe('unverified');
  });

  it('reports unverified when no vacancy dataset exists', () => {
    const item = checkVacancy(
      makeClaim({
        companyName: 'PT Karya Contoh Nusantara',
        position: 'Caregiver',
        destinationCountry: 'Taiwan',
      }),
      makeContext({ snapshot: makeSnapshot(), snapshotFreshness: 'fresh' }),
    );
    expect(item.status).toBe('unverified');
    expect(item.reason).toEqual({
      kind: 'message',
      key: 'check.vacancy.reason_source_unavailable',
    });
  });

  it('reports unverified when required fields are missing', () => {
    expect(checkVacancy(makeClaim({ position: 'Caregiver' }), makeContext()).status).toBe(
      'unverified',
    );
  });
});

describe('checkContract and checkVisa', () => {
  it('never marks a supplied document as verified', () => {
    expect(
      checkContract(makeClaim({ contractStatus: 'provided' }), makeContext()).status,
    ).toBe('unverified');
    expect(checkVisa(makeClaim({ visaStatus: 'provided' }), makeContext()).status).toBe(
      'unverified',
    );
  });

  it('always states the authenticity limitation', () => {
    const contract = checkContract(
      makeClaim({ contractStatus: 'provided' }),
      makeContext(),
    );
    expect(contract.limitation).toEqual({
      kind: 'message',
      key: 'check.contract.limitation',
    });
  });

  it('asks for the draft when no contract exists', () => {
    const item = checkContract(
      makeClaim({ contractStatus: 'not_provided' }),
      makeContext(),
    );
    expect(item.missingInformation).toContainEqual({
      kind: 'message',
      key: 'missing.contract_draft',
    });
  });
});
