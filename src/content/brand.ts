import type { Locale } from '@/content/locales/locale';

/**
 * Single source of truth for the product identity.
 *
 * Every user-visible mention of the product name, tagline, and description derives from
 * here — message catalogs, page metadata, the web app manifest, and the header wordmark.
 * Nothing else may hard-code the name, so a future rename is one edit in this file.
 *
 * The spelling is exactly `MigLens`: capital M, capital L, no space.
 */
export const BRAND = {
  name: 'MigLens',

  tagline: {
    id: 'Lihat bukti di balik setiap tawaran.',
    en: 'See the evidence behind every offer.',
  } satisfies Record<Locale, string>,

  description: {
    id: 'Pemeriksa tawaran kerja berbasis bukti untuk calon pekerja migran.',
    en: 'An evidence-based job offer checker for prospective migrant workers.',
  } satisfies Record<Locale, string>,

  /**
   * Prefix for the two browser-storage keys the product owns. The previous prefix is kept
   * only so stored data can be migrated once; it is never shown to a user.
   */
  storagePrefix: 'miglens',
  legacyStoragePrefix: 'migranshield',
} as const;

/** Locale tags for metadata. Kept next to the identity it describes. */
export const BRAND_LOCALE_TAG: Record<Locale, string> = {
  id: 'id_ID',
  en: 'en_GB',
};
