import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BRAND } from '@/content/brand';
import { migrateStorageKey } from '@/domain/privacy/storage-migration';
import {
  LEGACY_LOCALE_STORAGE_KEY,
  LOCALE_STORAGE_KEY,
  readStoredLocale,
  writeStoredLocale,
} from '@/domain/privacy/locale-storage';
import {
  LEGACY_PROGRESS_STORAGE_KEY,
  PROGRESS_STORAGE_KEY,
  readProgress,
} from '@/domain/progress/progress-storage';
import { emptyProgressState } from '@/domain/progress/progress-state';
import { idMessages } from '@/content/locales/id';
import { enMessages } from '@/content/locales/en';

const projectRoot = join(__dirname, '..', '..');

beforeEach(() => window.localStorage.clear());

describe('brand identity', () => {
  it('spells the product name exactly', () => {
    expect(BRAND.name).toBe('MigLens');
  });

  it('carries the reviewed taglines and descriptions', () => {
    expect(BRAND.tagline.id).toBe('Lihat bukti di balik setiap tawaran.');
    expect(BRAND.tagline.en).toBe('See the evidence behind every offer.');
    expect(BRAND.description.id).toBe(
      'Pemeriksa tawaran kerja berbasis bukti untuk calon pekerja migran.',
    );
    expect(BRAND.description.en).toBe(
      'An evidence-based job offer checker for prospective migrant workers.',
    );
  });

  it('uses the reviewed landing copy in both languages', () => {
    expect(idMessages['home.hero.body']).toBe(
      'MigLens membantu calon pekerja migran memeriksa informasi dalam tawaran kerja, menemukan ketidaksesuaian, dan menentukan langkah aman berikutnya.',
    );
    expect(enMessages['home.hero.body']).toBe(
      'MigLens helps prospective migrant workers examine job-offer information, identify inconsistencies, and decide on safer next steps.',
    );
  });
});

describe('no old brand name reaches the user', () => {
  const wrongSpellings = [
    /MigrantShield/,
    /MigranShield/,
    /\bMiglens\b/,
    /\bMIGLENS\b/,
    /\bMig Lens\b/,
  ];

  it.each(['id', 'en'] as const)(
    'has no old or misspelled name in the %s catalog',
    (locale) => {
      const catalog = locale === 'id' ? idMessages : enMessages;
      for (const [key, value] of Object.entries(catalog)) {
        for (const pattern of wrongSpellings) {
          expect(pattern.test(value), `${locale}:${key} → ${value}`).toBe(false);
        }
      }
    },
  );

  it('uses the exact spelling wherever the catalogs name the product', () => {
    const mentions = Object.values(idMessages).filter((value) => /miglens/i.test(value));
    expect(mentions.length).toBeGreaterThan(0);
    for (const value of mentions) expect(value).toContain('MigLens');
  });

  it('names the product correctly in the web app manifest', () => {
    const manifest = JSON.parse(
      readFileSync(join(projectRoot, 'public', 'manifest.webmanifest'), 'utf8'),
    ) as { name: string; short_name: string; description: string };
    expect(manifest.name).toBe('MigLens');
    expect(manifest.short_name).toBe('MigLens');
    expect(manifest.description).not.toMatch(/Migran|Migrant(?!\s)/);
  });

  it('uses a renamed service-worker cache so the old shell is dropped', () => {
    const source = readFileSync(join(projectRoot, 'public', 'sw.js'), 'utf8');
    expect(source).toContain("const CACHE_VERSION = 'miglens-shell-v3'");
    expect(source).toContain('caches.delete');
  });
});

describe('storage key migration', () => {
  it('moves a legacy value to the current key', () => {
    window.localStorage.setItem('legacy.key', 'value-1');
    migrateStorageKey('current.key', 'legacy.key');
    expect(window.localStorage.getItem('current.key')).toBe('value-1');
    expect(window.localStorage.getItem('legacy.key')).toBeNull();
  });

  it('is a no-op when there is nothing to migrate', () => {
    migrateStorageKey('current.key', 'legacy.key');
    expect(window.localStorage.length).toBe(0);
  });

  it('keeps the current value and drops the legacy copy when both exist', () => {
    window.localStorage.setItem('current.key', 'new');
    window.localStorage.setItem('legacy.key', 'old');
    migrateStorageKey('current.key', 'legacy.key');
    expect(window.localStorage.getItem('current.key')).toBe('new');
    expect(window.localStorage.getItem('legacy.key')).toBeNull();
  });

  it('is safe to run repeatedly', () => {
    window.localStorage.setItem('legacy.key', 'value-1');
    for (let index = 0; index < 5; index += 1) {
      migrateStorageKey('current.key', 'legacy.key');
    }
    expect(window.localStorage.getItem('current.key')).toBe('value-1');
    expect(window.localStorage.length).toBe(1);
  });

  it('does not throw when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    expect(() => migrateStorageKey('current.key', 'legacy.key')).not.toThrow();
    vi.restoreAllMocks();
  });

  it('never invents a value when the legacy key is absent', () => {
    window.localStorage.setItem('current.key', 'kept');
    migrateStorageKey('current.key', 'legacy.key');
    expect(window.localStorage.getItem('current.key')).toBe('kept');
  });
});

describe('the rename keeps existing user data', () => {
  it('uses the new key names', () => {
    expect(LOCALE_STORAGE_KEY).toBe('miglens.uiLocale');
    expect(PROGRESS_STORAGE_KEY).toBe('miglens.progress');
    expect(LEGACY_LOCALE_STORAGE_KEY).toBe('migranshield.uiLocale');
    expect(LEGACY_PROGRESS_STORAGE_KEY).toBe('migranshield.progress');
  });

  it('carries a saved language choice across the rename', () => {
    window.localStorage.setItem(LEGACY_LOCALE_STORAGE_KEY, 'en');
    expect(readStoredLocale()).toBe('en');
    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('en');
    expect(window.localStorage.getItem(LEGACY_LOCALE_STORAGE_KEY)).toBeNull();
  });

  it('carries saved progress and history across the rename', () => {
    const stored = {
      schemaVersion: 1,
      completedScenarioIds: ['caregiver-taiwan-urgency'],
      history: [
        {
          localId: 'local-1',
          checkedAt: '2026-08-11T03:00:00.000Z',
          indicatorCount: 4,
          evidenceCounts: {
            source_match: 1,
            unverified: 5,
            mismatch: 0,
            risk_indicator: 4,
          },
          ruleIds: ['TIME_PRESSURE_IMMEDIATE_TRANSFER'],
          ruleVersions: ['1.0.0'],
          sourceDataVersion: null,
        },
      ],
    };
    window.localStorage.setItem(LEGACY_PROGRESS_STORAGE_KEY, JSON.stringify(stored));

    const migrated = readProgress();
    expect(migrated.completedScenarioIds).toEqual(['caregiver-taiwan-urgency']);
    expect(migrated.history).toHaveLength(1);
    expect(migrated.history[0]?.localId).toBe('local-1');
    expect(window.localStorage.getItem(LEGACY_PROGRESS_STORAGE_KEY)).toBeNull();
  });

  it('does not duplicate history when the migration runs again', () => {
    window.localStorage.setItem(
      LEGACY_PROGRESS_STORAGE_KEY,
      JSON.stringify(emptyProgressState),
    );
    readProgress();
    readProgress();
    readProgress();
    expect(Object.keys({ ...window.localStorage })).toEqual([PROGRESS_STORAGE_KEY]);
  });

  it('keeps the newer value when both the old and the new key exist', () => {
    writeStoredLocale('id');
    window.localStorage.setItem(LEGACY_LOCALE_STORAGE_KEY, 'en');
    expect(readStoredLocale()).toBe('id');
    expect(window.localStorage.getItem(LEGACY_LOCALE_STORAGE_KEY)).toBeNull();
  });

  it('writes no extra key as a result of the rename', () => {
    window.localStorage.setItem(LEGACY_LOCALE_STORAGE_KEY, 'en');
    window.localStorage.setItem(
      LEGACY_PROGRESS_STORAGE_KEY,
      JSON.stringify(emptyProgressState),
    );
    readStoredLocale();
    readProgress();
    expect(Object.keys({ ...window.localStorage }).sort()).toEqual(
      [LOCALE_STORAGE_KEY, PROGRESS_STORAGE_KEY].sort(),
    );
  });

  it('stores nothing new or sensitive during migration', () => {
    window.localStorage.setItem(
      LEGACY_PROGRESS_STORAGE_KEY,
      JSON.stringify(emptyProgressState),
    );
    readProgress();
    const raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY) ?? '';
    expect(JSON.parse(raw)).toEqual(emptyProgressState);
  });
});
