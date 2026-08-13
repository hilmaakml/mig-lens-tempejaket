'use client';

import { ScreenHeader } from '@/components/layout/screen-header';
import { LinkButton } from '@/components/ui/button';
import { Notice } from '@/components/ui/notice';
import { useLocale } from '@/app/providers/locale-provider';
import type { MessageKey } from '@/content/locales/message-key';

interface Pattern {
  readonly titleKey: MessageKey;
  readonly quoteKey: MessageKey;
  readonly bodyKey: MessageKey;
  readonly isPayment?: boolean;
}

const PATTERNS: readonly Pattern[] = [
  {
    titleKey: 'pattern.authority.title',
    quoteKey: 'pattern.authority.quote',
    bodyKey: 'pattern.authority.body',
  },
  {
    titleKey: 'pattern.urgency.title',
    quoteKey: 'pattern.urgency.quote',
    bodyKey: 'pattern.urgency.body',
  },
  {
    titleKey: 'pattern.skip.title',
    quoteKey: 'pattern.skip.quote',
    bodyKey: 'pattern.skip.body',
  },
  {
    titleKey: 'pattern.payment.title',
    quoteKey: 'pattern.payment.quote',
    bodyKey: 'pattern.payment.body',
    isPayment: true,
  },
];

export default function PatternPage() {
  const { t } = useLocale();

  return (
    <div className="pb-8">
      <ScreenHeader titleKey="pattern.title" backHref="/app/latihan" />

      <div className="flex flex-col gap-4 px-4 py-4">
        <p className="text-[14.5px] leading-relaxed text-text-secondary">
          {t('pattern.intro')}
        </p>

        <ol className="flex flex-col gap-3">
          {PATTERNS.map((pattern, index) => (
            <li
              key={pattern.titleKey}
              className={`rounded-card border bg-surface-card p-4 ${
                pattern.isPayment ? 'border-risk-border' : 'border-border-default'
              }`}
            >
              <div className="mb-3 flex items-center gap-2.5">
                <span
                  className={`flex size-7 shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white ${
                    pattern.isPayment ? 'bg-risk-text' : 'bg-brand-dark'
                  }`}
                >
                  {index + 1}
                </span>
                <h2
                  className={`text-[15px] font-bold ${
                    pattern.isPayment ? 'text-risk-text' : 'text-text-primary'
                  }`}
                >
                  {t(pattern.titleKey)}
                </h2>
              </div>
              <blockquote
                className={`rounded-lg border-l-[3px] px-3 py-2.5 text-[13.5px] italic ${
                  pattern.isPayment
                    ? 'border-risk-border bg-risk-bg text-risk-text'
                    : 'border-border-strong bg-surface-app text-text-secondary'
                }`}
              >
                {t(pattern.quoteKey)}
              </blockquote>
              <p className="mt-2.5 text-[13.5px] leading-relaxed text-text-secondary">
                {t(pattern.bodyKey)}
              </p>
            </li>
          ))}
        </ol>

        <Notice tone="warning">{t('pattern.closing')}</Notice>
        <LinkButton href="/app/skenario" variant="dark">
          {t('pattern.scenario_cta')}
        </LinkButton>
      </div>
    </div>
  );
}
