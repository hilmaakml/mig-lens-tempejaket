import { parseSnapshot, type SourceSnapshot } from '@/domain/sources/snapshot';

/**
 * SYNTHETIC TEST DATASET — NOT AN OFFICIAL RECORD.
 *
 * Every name, licence string, address, phone number, and URL below is invented for the
 * prototype and uses reserved example values (CONVENTIONS.md 10.4, DATA_SOURCES.md 7).
 * This file must never be read by a production source adapter: it is reachable only from
 * the demo flow the user explicitly starts, and every result built from it is labelled
 * "Contoh hasil prototipe".
 */
export const DEMO_SNAPSHOT_ID = 'demo-p3mi-2026-08-01';

export const demoP3miSnapshot: SourceSnapshot = parseSnapshot({
  snapshotId: DEMO_SNAPSHOT_ID,
  sourceId: 'siskop2mi-p3mi',
  canonicalUrl: 'https://siskop2mi.bp2mi.go.id/profil/lembaga/list_lembaga/p3mi',
  retrievedAt: '2026-08-01T00:00:00.000Z',
  effectiveDate: '2026-08-01',
  retrievalMethod: 'synthetic',
  parserVersion: 'demo-1.0.0',
  contentHash: 'demo-fixture-no-hash',
  recordCount: 2,
  importStatus: 'validated',
  reviewStatus: 'reviewed',
  supersedesSnapshotId: null,
  isDemo: true,
  p3miRecords: [
    {
      recordId: 'demo-p3mi-001',
      officialName: 'PT Karya Contoh Nusantara',
      licenceNumber: 'CONTOH-000/UJI/2026',
      address: 'Jalan Contoh No. 1, Kota Uji (data uji)',
      officialContacts: [
        { kind: 'phone', value: '+62 21 0000 0000' },
        { kind: 'email', value: 'kantor@example.com' },
        { kind: 'website', value: 'https://example.com' },
      ],
      // A public directory does not promise that every legitimate number is listed, so an
      // unlisted handle stays "unverified" instead of being called a mismatch.
      isContactListComplete: false,
      sanctionNote: null,
    },
    {
      recordId: 'demo-p3mi-002',
      officialName: 'PT Uji Coba Penempatan',
      licenceNumber: 'CONTOH-001/UJI/2026',
      address: 'Jalan Uji No. 2, Kota Contoh (data uji)',
      officialContacts: [{ kind: 'phone', value: '+62 21 0000 0001' }],
      isContactListComplete: false,
      sanctionNote: 'Contoh catatan sanksi administratif (data uji).',
    },
  ],
  vacancyRecords: [
    {
      recordId: 'demo-vacancy-001',
      companyName: 'PT Karya Contoh Nusantara',
      position: 'Operator Produksi',
      destinationCountry: 'Malaysia',
    },
  ],
});
