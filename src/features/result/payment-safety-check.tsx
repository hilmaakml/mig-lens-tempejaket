'use client';

import { useId, useState } from 'react';
import { Icon } from '@/components/ui/icon';
import { useLocale } from '@/app/providers/locale-provider';
import type { OfferClaim } from '@/domain/claims/offer-claim';
import type { EvidenceItem } from '@/domain/evidence/evidence-item';
import type { MessageKey } from '@/content/locales/message-key';
import { maskPersonName } from '@/domain/privacy/mask';

type RowTone = 'risk' | 'unknown' | 'info';

interface Row {
  readonly labelKey: MessageKey;
  readonly value: string;
  readonly tone: RowTone;
}

interface PaymentSafetyCheckProps {
  readonly claim: OfferClaim;
  /** Rule outputs for the payment and time-pressure categories. */
  readonly ruleItems: readonly EvidenceItem[];
}

/**
 * Payment Safety Check (PRD FR-08). Each row's tone is derived from the rule outputs, so a
 * badge can never disagree with the triggered-indicator list on the same screen.
 */
export function PaymentSafetyCheck({ claim, ruleItems }: PaymentSafetyCheckProps) {
  const { t } = useLocale();
  const [isOpen, setIsOpen] = useState(true);
  const panelId = useId();

  const toneFor = (ruleId: string, fallbackUnknown: boolean): RowTone => {
    const item = ruleItems.find((entry) => entry.ruleId === ruleId);
    if (item?.status === 'risk_indicator') return 'risk';
    if (item?.status === 'unverified' || fallbackUnknown) return 'unknown';
    return 'info';
  };

  const documentValue = (status: OfferClaim['writtenFeeBreakdown']): string =>
    t(`option.document.${status}`);

  const rows: readonly Row[] = [
    {
      labelKey: 'result.payment_item.amount',
      value: claim.paymentAmount || t('confirm.empty'),
      tone: 'info',
    },
    {
      labelKey: 'result.payment_item.purpose',
      value: claim.paymentPurpose || t('confirm.empty'),
      tone: toneFor('PAYMENT_PURPOSE_DIFFERS_FROM_AGREEMENT', false),
    },
    {
      labelKey: 'result.payment_item.recipient',
      // Recipient names are personal data: shown as initials only (SECURITY.md 7).
      value: claim.paymentRecipient
        ? maskPersonName(claim.paymentRecipient)
        : t('confirm.empty'),
      tone: toneFor('PAYMENT_RECIPIENT_DIFFERS_FROM_AGREEMENT', false),
    },
    {
      labelKey: 'result.payment_item.account_type',
      value: t(`option.account.${claim.accountType}`),
      tone: toneFor(
        'PAYMENT_PERSONAL_ACCOUNT_UNVERIFIED',
        claim.accountType === 'unknown',
      ),
    },
    {
      labelKey: 'result.payment_item.fee_breakdown',
      value: documentValue(claim.writtenFeeBreakdown),
      tone: toneFor('PAYMENT_NO_WRITTEN_FEE_BREAKDOWN', false),
    },
    {
      labelKey: 'result.payment_item.receipt',
      value: documentValue(claim.receipt),
      tone: claim.receipt === 'provided' ? 'info' : 'unknown',
    },
    {
      labelKey: 'result.payment_item.time_pressure',
      value: t(`option.time.${claim.timePressure}`),
      tone: toneFor('TIME_PRESSURE_IMMEDIATE_TRANSFER', false),
    },
    {
      labelKey: 'result.payment_item.official_confirmation',
      value: t(`option.confirmation.${claim.officialChannelConfirmation}`),
      tone: claim.officialChannelConfirmation === 'done' ? 'info' : 'unknown',
    },
  ];

  const summaryAccount = t(`option.account.${claim.accountType}`);

  return (
    <section className="overflow-hidden rounded-card border border-border-default bg-surface-card">
      <h3>
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          aria-expanded={isOpen}
          aria-controls={panelId}
          className="flex min-h-11 w-full items-center gap-3 px-4 py-3.5 text-left"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-risk-bg text-risk-text">
            <Icon name="card" size={19} />
          </span>
          <span className="flex-1">
            <span className="block text-[14.5px] font-bold text-text-primary">
              {t('result.payment_check')}
            </span>
            <span className="block text-xs text-text-muted">
              {t('result.payment_check_summary', {
                amount: claim.paymentAmount || t('confirm.empty'),
                account: summaryAccount,
              })}
            </span>
          </span>
          <Icon
            name="chevron-down"
            size={20}
            className={`shrink-0 text-border-strong transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
      </h3>

      <div id={panelId} hidden={!isOpen} className="px-4 pb-4">
        <ul className="border-t border-border-default">
          {rows.map((row) => (
            <li
              key={row.labelKey}
              className="flex items-center gap-2 border-b border-border-default py-2.5 last:border-b-0"
            >
              <span className="flex-1">
                <span className="block text-[13px] font-semibold text-text-primary">
                  {t(row.labelKey)}
                </span>
                <span className="block text-xs text-text-muted">{row.value}</span>
              </span>
              <RowBadge tone={row.tone} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function RowBadge({ tone }: { readonly tone: RowTone }) {
  const { t } = useLocale();
  if (tone === 'info') {
    return (
      <span className="text-[10.5px] font-bold text-text-faint">
        {t('result.payment_badge_info')}
      </span>
    );
  }
  const isRisk = tone === 'risk';
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-md border px-2 py-1 text-[10.5px] font-bold ${
        isRisk
          ? 'border-risk-border bg-risk-bg text-risk-text'
          : 'border-unknown-border bg-unknown-bg text-unknown-text'
      }`}
    >
      <Icon name={isRisk ? 'warning' : 'question'} size={12} strokeWidth={2.2} />
      {t(isRisk ? 'result.payment_badge_risk' : 'result.payment_badge_unknown')}
    </span>
  );
}
