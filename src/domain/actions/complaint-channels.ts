import type { EvidenceItem } from '@/domain/evidence/evidence-item';
import type { MessageKey } from '@/content/locales/message-key';
import {
  getOpenableUrl,
  getDomainLabel,
  getSource,
} from '@/domain/sources/source-registry';

/**
 * Contextual complaint-channel selection (PRD FR-12).
 *
 * MigranShield never submits a report. Every channel is a link-out to an official service,
 * carries no offer content in the URL, and is only openable when the registry holds a
 * reviewed HTTPS URL on an allowlisted domain. A channel without one renders as
 * unavailable with an approved alternative — never a guessed or demo URL.
 */

export type ComplaintChannelId =
  | 'aduannomor'
  | 'cekrekening'
  | 'kp2mi-complaint'
  | 'peduli-wni';

export interface ComplaintChannel {
  readonly id: ComplaintChannelId;
  /** Source registry entry backing this channel. */
  readonly sourceId: string;
  readonly reportObjectKey: MessageKey;
  readonly whyRelevantKey: MessageKey;
  readonly evidenceHintKey: MessageKey;
  readonly limitationKey: MessageKey;
  /** Registry source shown when this channel has no openable URL. */
  readonly alternativeSourceId: string;
}

export const COMPLAINT_CHANNELS: readonly ComplaintChannel[] = [
  {
    id: 'aduannomor',
    sourceId: 'aduannomor',
    reportObjectKey: 'complaint.aduannomor.object',
    whyRelevantKey: 'complaint.aduannomor.why',
    evidenceHintKey: 'complaint.aduannomor.evidence',
    limitationKey: 'complaint.aduannomor.limitation',
    alternativeSourceId: 'siskop2mi-p3mi',
  },
  {
    id: 'cekrekening',
    sourceId: 'cekrekening',
    reportObjectKey: 'complaint.cekrekening.object',
    whyRelevantKey: 'complaint.cekrekening.why',
    evidenceHintKey: 'complaint.cekrekening.evidence',
    limitationKey: 'complaint.cekrekening.limitation',
    alternativeSourceId: 'siskop2mi-p3mi',
  },
  {
    id: 'kp2mi-complaint',
    sourceId: 'kp2mi-complaint',
    reportObjectKey: 'complaint.kp2mi.object',
    whyRelevantKey: 'complaint.kp2mi.why',
    evidenceHintKey: 'complaint.kp2mi.evidence',
    limitationKey: 'complaint.kp2mi.limitation',
    alternativeSourceId: 'siskop2mi-p3mi',
  },
  {
    id: 'peduli-wni',
    sourceId: 'peduli-wni',
    reportObjectKey: 'complaint.peduli_wni.object',
    whyRelevantKey: 'complaint.peduli_wni.why',
    evidenceHintKey: 'complaint.peduli_wni.evidence',
    limitationKey: 'complaint.peduli_wni.limitation',
    alternativeSourceId: 'siskop2mi-p3mi',
  },
];

export interface ComplaintChannelView {
  readonly channel: ComplaintChannel;
  readonly sourceNameKey: MessageKey;
  /** Non-null only when the registry holds a reviewed, allowlisted HTTPS URL. */
  readonly url: string | null;
  readonly domain: string | null;
  readonly isRecommended: boolean;
  readonly recommendationReasonKey: MessageKey | null;
  /** Approved alternative shown when `url` is null. */
  readonly alternative: {
    readonly nameKey: MessageKey;
    readonly url: string | null;
  } | null;
}

/**
 * Recommends channels from the triggered evidence. A recommendation says a service may be
 * relevant; it never says fraud occurred and never says an unreported number or account
 * is safe.
 */
export function buildComplaintChannelViews(
  items: readonly EvidenceItem[],
): readonly ComplaintChannelView[] {
  const isTriggered = (ruleId: string) =>
    items.some((item) => item.ruleId === ruleId && item.status === 'risk_indicator');

  const contactUnresolved = items.some(
    (item) => item.category === 'contact' && item.status !== 'source_match',
  );

  const recommendations: Partial<Record<ComplaintChannelId, MessageKey>> = {};
  if (contactUnresolved || isTriggered('PAYMENT_CONTACT_UNVERIFIED')) {
    recommendations.aduannomor = 'complaint.aduannomor.recommended_because';
  }
  if (
    isTriggered('PAYMENT_PERSONAL_ACCOUNT_UNVERIFIED') ||
    isTriggered('PAYMENT_RECIPIENT_DIFFERS_FROM_AGREEMENT')
  ) {
    recommendations.cekrekening = 'complaint.cekrekening.recommended_because';
  }
  if (items.some((item) => item.category === 'company' || item.category === 'vacancy')) {
    recommendations['kp2mi-complaint'] = 'complaint.kp2mi.recommended_because';
  }

  return COMPLAINT_CHANNELS.map((channel) => {
    const entry = getSource(channel.sourceId);
    const url = getOpenableUrl(channel.sourceId);
    const alternativeUrl = getOpenableUrl(channel.alternativeSourceId);
    const alternativeEntry = getSource(channel.alternativeSourceId);
    const reason = recommendations[channel.id] ?? null;
    return {
      channel,
      sourceNameKey: entry?.nameKey ?? 'source.unknown',
      url,
      domain: url ? getDomainLabel(url) : null,
      isRecommended: reason !== null,
      recommendationReasonKey: reason,
      alternative:
        url === null && alternativeEntry
          ? { nameKey: alternativeEntry.nameKey, url: alternativeUrl }
          : null,
    };
  });
}
