'use client';

import { Icon, type IconName } from '@/components/ui/icon';
import { STATUS_LABEL_KEY, type EvidenceStatus } from '@/domain/evidence/evidence-item';
import { useLocale } from '@/app/providers/locale-provider';
import type { MessageKey } from '@/content/locales/message-key';

/**
 * Status is carried by text + icon + shape; colour is an extra signal only, so the badge
 * stays readable in grayscale and for colour-blind users (DESIGN.md 3, TESTING.md 6).
 */
const STYLES: Record<EvidenceStatus, { className: string; icon: IconName }> = {
  source_match: {
    className: 'bg-match-bg text-match-text border-match-border',
    icon: 'check',
  },
  unverified: {
    className: 'bg-unknown-bg text-unknown-text border-unknown-border',
    icon: 'question',
  },
  mismatch: {
    className: 'bg-mismatch-bg text-mismatch-text border-mismatch-border',
    icon: 'cross',
  },
  risk_indicator: {
    className: 'bg-risk-bg text-risk-text border-risk-border',
    icon: 'warning',
  },
};

interface StatusBadgeProps {
  readonly status: EvidenceStatus;
  /** Overrides the default status wording, e.g. "Ditemukan di sumber resmi" on the P3MI card. */
  readonly labelKey?: MessageKey;
}

export function StatusBadge({ status, labelKey }: StatusBadgeProps) {
  const { t } = useLocale();
  const style = STYLES[status];
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-pill border px-2.5 py-1 text-[11px] leading-tight font-bold ${style.className}`}
      data-status={status}
    >
      <Icon name={style.icon} size={13} strokeWidth={2.3} />
      {t(labelKey ?? STATUS_LABEL_KEY[status])}
    </span>
  );
}
