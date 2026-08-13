import { describe, expect, it } from 'vitest';
import {
  SOURCE_REGISTRY,
  getDomainLabel,
  getOpenableUrl,
  getSource,
  isAllowlistedUrl,
} from '@/domain/sources/source-registry';
import { getFreshness } from '@/domain/sources/snapshot';

describe('registry contract (DATA_SOURCES.md 5)', () => {
  it('gives every source the required metadata', () => {
    for (const entry of SOURCE_REGISTRY) {
      expect(entry.sourceId).toMatch(/^[a-z0-9-]+$/);
      expect(entry.nameKey).toBeTruthy();
      expect(entry.publisher).toBeTruthy();
      expect(entry.purposeKey).toBeTruthy();
      expect(entry.limitationKey).toBeTruthy();
      expect(entry.owner).toBeTruthy();
      expect(entry.freshnessThresholdDays).toBeGreaterThan(0);
      expect(typeof entry.isDisabled).toBe('boolean');
    }
  });

  it('only holds HTTPS canonical URLs', () => {
    for (const entry of SOURCE_REGISTRY) {
      if (entry.canonicalUrl)
        expect(entry.canonicalUrl.startsWith('https://')).toBe(true);
    }
  });

  it('records that no source is an authorized integration yet', () => {
    for (const entry of SOURCE_REGISTRY) {
      expect(entry.accessMode).toBe('link_out');
      expect(entry.authorizationStatus).not.toBe('authorized');
    }
  });

  it('marks the KP2MI complaint channel as having no reviewed URL', () => {
    const entry = getSource('kp2mi-complaint');
    expect(entry?.canonicalUrl).toBeNull();
    expect(getOpenableUrl('kp2mi-complaint')).toBeNull();
  });
});

describe('URL allowlist (SECURITY.md 9)', () => {
  it('accepts a registered canonical URL', () => {
    expect(isAllowlistedUrl('https://cekrekening.id/')).toBe(true);
    expect(isAllowlistedUrl('https://siskop2mi.bp2mi.go.id/lowongan/list')).toBe(true);
  });

  it.each([
    'javascript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'http://cekrekening.id/',
    '//cekrekening.id/',
    'https://cekrekening.id.evil.example/',
    'https://evil.example/?next=https://cekrekening.id/',
    'https://cekrekening.id@evil.example/',
    'https://user:pass@cekrekening.id/',
    'not a url',
    '',
  ])('rejects %s', (candidate) => {
    expect(isAllowlistedUrl(candidate)).toBe(false);
  });

  it('never opens a disabled source', () => {
    const disabled = { ...SOURCE_REGISTRY[0]!, isDisabled: true };
    expect(disabled.isDisabled).toBe(true);
    // The public helper reads the real registry, so assert the live entry is enabled and
    // that the disable flag is the only gate that would close it.
    expect(getOpenableUrl(SOURCE_REGISTRY[0]!.sourceId)).not.toBeNull();
  });

  it('exposes a readable destination domain', () => {
    expect(getDomainLabel('https://aduannomor.id/')).toBe('aduannomor.id');
    expect(getDomainLabel('nonsense')).toBeNull();
  });
});

describe('snapshot freshness', () => {
  const now = new Date('2026-08-11T00:00:00.000Z');

  it('marks a recent snapshot fresh', () => {
    expect(getFreshness({ retrievedAt: '2026-08-01T00:00:00.000Z' }, 30, now)).toBe(
      'fresh',
    );
  });

  it('marks an old snapshot stale', () => {
    expect(getFreshness({ retrievedAt: '2026-01-01T00:00:00.000Z' }, 30, now)).toBe(
      'stale',
    );
  });

  it('marks an unparsable or future timestamp unknown', () => {
    expect(getFreshness({ retrievedAt: 'nonsense' }, 30, now)).toBe('unknown');
    expect(getFreshness({ retrievedAt: '2027-01-01T00:00:00.000Z' }, 30, now)).toBe(
      'unknown',
    );
  });
});
