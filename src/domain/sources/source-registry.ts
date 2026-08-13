import type { SourceTier } from '@/domain/evidence/evidence-item';
import type { MessageKey } from '@/content/locales/message-key';

/**
 * Approved source registry (DATA_SOURCES.md 3 and 5).
 *
 * IMPORTANT: none of these sources is integrated. No MigranShield component fetches them.
 * `accessMode: 'link_out'` means the application may only render a link to the canonical
 * URL for the user to check manually. `authorizationStatus` records that reuse,
 * snapshotting, or API access has NOT been granted — an owner decision is still open
 * (PRD section 19).
 */

export type SourceAccessMode = 'link_out' | 'reviewed_snapshot' | 'authorized_api';

export type SourceAuthorizationStatus =
  | 'not_requested'
  | 'requested'
  | 'authorized'
  | 'not_authorized';

export interface SourceRegistryEntry {
  readonly sourceId: string;
  readonly nameKey: MessageKey;
  readonly publisher: string;
  /** Canonical HTTPS URL. `null` when no reviewed URL exists for this purpose yet. */
  readonly canonicalUrl: string | null;
  readonly canonicalDomain: string | null;
  readonly tier: SourceTier;
  readonly purposeKey: MessageKey;
  readonly limitationKey: MessageKey;
  readonly accessMode: SourceAccessMode;
  readonly authorizationStatus: SourceAuthorizationStatus;
  /** Fields the product is permitted to compare against, for review traceability. */
  readonly fieldsUsed: readonly string[];
  /** Days after retrieval at which a snapshot must be shown as stale. */
  readonly freshnessThresholdDays: number;
  readonly owner: string;
  /** Emergency kill switch. A disabled source can never be opened or matched. */
  readonly isDisabled: boolean;
}

export const SOURCE_REGISTRY: readonly SourceRegistryEntry[] = [
  {
    sourceId: 'siskop2mi-p3mi',
    nameKey: 'source.siskop2mi_p3mi.name',
    publisher: 'SISKOP2MI — KP2MI/BP2MI',
    canonicalUrl: 'https://siskop2mi.bp2mi.go.id/profil/lembaga/list_lembaga/p3mi',
    canonicalDomain: 'siskop2mi.bp2mi.go.id',
    tier: 'official_primary',
    purposeKey: 'source.siskop2mi_p3mi.purpose',
    limitationKey: 'source.siskop2mi_p3mi.limitation',
    accessMode: 'link_out',
    authorizationStatus: 'not_requested',
    fieldsUsed: ['officialName', 'licenceNumber', 'address', 'officialContacts'],
    freshnessThresholdDays: 30,
    owner: 'product-owner (unassigned)',
    isDisabled: false,
  },
  {
    sourceId: 'siskop2mi-sanctions',
    nameKey: 'source.siskop2mi_sanctions.name',
    publisher: 'SISKOP2MI — KP2MI/BP2MI',
    canonicalUrl: 'https://siskop2mi.bp2mi.go.id/profil/lembaga/list_lembaga/p3mi_sanksi',
    canonicalDomain: 'siskop2mi.bp2mi.go.id',
    tier: 'official_primary',
    purposeKey: 'source.siskop2mi_sanctions.purpose',
    limitationKey: 'source.siskop2mi_sanctions.limitation',
    accessMode: 'link_out',
    authorizationStatus: 'not_requested',
    fieldsUsed: ['companyName', 'sanctionType', 'sanctionDate'],
    freshnessThresholdDays: 7,
    owner: 'product-owner (unassigned)',
    isDisabled: false,
  },
  {
    sourceId: 'siskop2mi-vacancies',
    nameKey: 'source.siskop2mi_vacancies.name',
    publisher: 'SISKOP2MI — KP2MI/BP2MI',
    canonicalUrl: 'https://siskop2mi.bp2mi.go.id/lowongan/list',
    canonicalDomain: 'siskop2mi.bp2mi.go.id',
    tier: 'official_primary',
    purposeKey: 'source.siskop2mi_vacancies.purpose',
    limitationKey: 'source.siskop2mi_vacancies.limitation',
    accessMode: 'link_out',
    authorizationStatus: 'not_requested',
    fieldsUsed: ['companyName', 'position', 'destinationCountry'],
    freshnessThresholdDays: 7,
    owner: 'product-owner (unassigned)',
    isDisabled: false,
  },
  {
    sourceId: 'jdih-kp2mi',
    nameKey: 'source.jdih.name',
    publisher: 'JDIH KP2MI/BP2MI',
    canonicalUrl: 'https://jdih.bp2mi.go.id/',
    canonicalDomain: 'jdih.bp2mi.go.id',
    tier: 'official_guidance',
    purposeKey: 'source.jdih.purpose',
    limitationKey: 'source.jdih.limitation',
    accessMode: 'link_out',
    authorizationStatus: 'not_requested',
    fieldsUsed: ['regulationReference'],
    freshnessThresholdDays: 180,
    owner: 'legal reviewer (unassigned)',
    isDisabled: false,
  },
  {
    sourceId: 'permen-17-2025',
    nameKey: 'source.permen_17_2025.name',
    publisher: 'JDIH KP2MI/BP2MI',
    canonicalUrl: 'https://jdih.bp2mi.go.id/index.php/Content/produk/8/889000625',
    canonicalDomain: 'jdih.bp2mi.go.id',
    tier: 'official_guidance',
    purposeKey: 'source.permen_17_2025.purpose',
    limitationKey: 'source.permen_17_2025.limitation',
    accessMode: 'link_out',
    authorizationStatus: 'not_requested',
    fieldsUsed: ['placementFeeGovernance'],
    freshnessThresholdDays: 180,
    owner: 'legal reviewer (unassigned)',
    isDisabled: false,
  },
  {
    sourceId: 'cekrekening',
    nameKey: 'source.cekrekening.name',
    publisher: 'Kementerian Komunikasi dan Digital',
    canonicalUrl: 'https://cekrekening.id/',
    canonicalDomain: 'cekrekening.id',
    tier: 'official_guidance',
    purposeKey: 'source.cekrekening.purpose',
    limitationKey: 'source.cekrekening.limitation',
    accessMode: 'link_out',
    authorizationStatus: 'not_requested',
    fieldsUsed: [],
    freshnessThresholdDays: 365,
    owner: 'product-owner (unassigned)',
    isDisabled: false,
  },
  {
    sourceId: 'aduannomor',
    nameKey: 'source.aduannomor.name',
    publisher: 'Kementerian Komunikasi dan Digital',
    canonicalUrl: 'https://aduannomor.id/',
    canonicalDomain: 'aduannomor.id',
    tier: 'official_guidance',
    purposeKey: 'source.aduannomor.purpose',
    limitationKey: 'source.aduannomor.limitation',
    accessMode: 'link_out',
    authorizationStatus: 'not_requested',
    fieldsUsed: [],
    freshnessThresholdDays: 365,
    owner: 'product-owner (unassigned)',
    isDisabled: false,
  },
  {
    sourceId: 'peduli-wni',
    nameKey: 'source.peduli_wni.name',
    publisher: 'Kementerian Luar Negeri RI',
    canonicalUrl: 'https://peduliwni.kemlu.go.id/',
    canonicalDomain: 'peduliwni.kemlu.go.id',
    tier: 'official_guidance',
    purposeKey: 'source.peduli_wni.purpose',
    limitationKey: 'source.peduli_wni.limitation',
    accessMode: 'link_out',
    authorizationStatus: 'not_requested',
    fieldsUsed: [],
    freshnessThresholdDays: 365,
    owner: 'product-owner (unassigned)',
    isDisabled: false,
  },
  {
    // PRD section 19 leaves the canonical KP2MI/BP2MI complaint URL as an open owner
    // decision. Until a URL is reviewed and entered here, the complaint channel must
    // render as unavailable with an approved alternative — never a guessed URL.
    sourceId: 'kp2mi-complaint',
    nameKey: 'source.kp2mi_complaint.name',
    publisher: 'KP2MI/BP2MI',
    canonicalUrl: null,
    canonicalDomain: null,
    tier: 'official_guidance',
    purposeKey: 'source.kp2mi_complaint.purpose',
    limitationKey: 'source.kp2mi_complaint.limitation',
    accessMode: 'link_out',
    authorizationStatus: 'not_requested',
    fieldsUsed: [],
    freshnessThresholdDays: 90,
    owner: 'product-owner (unassigned)',
    isDisabled: false,
  },
];

const REGISTRY_BY_ID = new Map(SOURCE_REGISTRY.map((entry) => [entry.sourceId, entry]));

export function getSource(sourceId: string): SourceRegistryEntry | undefined {
  return REGISTRY_BY_ID.get(sourceId);
}

/** A link may only be rendered when the source is enabled and has a reviewed HTTPS URL. */
export function getOpenableUrl(sourceId: string): string | null {
  const entry = REGISTRY_BY_ID.get(sourceId);
  if (!entry || entry.isDisabled) return null;
  if (!entry.canonicalUrl) return null;
  return isAllowlistedUrl(entry.canonicalUrl) ? entry.canonicalUrl : null;
}

const ALLOWED_DOMAINS = new Set(
  SOURCE_REGISTRY.map((entry) => entry.canonicalDomain).filter(
    (domain): domain is string => domain !== null,
  ),
);

/**
 * Only HTTPS URLs on a registered canonical domain may be opened. This blocks
 * `javascript:`, `data:`, protocol-relative, and userinfo-spoofed URLs, and prevents an
 * offer-supplied link from ever becoming an "official" destination (SECURITY.md 9).
 */
export function isAllowlistedUrl(rawUrl: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return false;
  }
  if (parsed.protocol !== 'https:') return false;
  if (parsed.username.length > 0 || parsed.password.length > 0) return false;
  return ALLOWED_DOMAINS.has(parsed.hostname);
}

export function getDomainLabel(rawUrl: string): string | null {
  try {
    return new URL(rawUrl).hostname;
  } catch {
    return null;
  }
}
