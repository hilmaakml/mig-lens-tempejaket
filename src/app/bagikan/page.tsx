'use client';

import { useMemo } from 'react';
import { ScreenHeader } from '@/components/layout/screen-header';
import { Button, LinkButton } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Notice } from '@/components/ui/notice';
import { useLocale } from '@/app/providers/locale-provider';
import { useOffer } from '@/app/providers/offer-provider';
import { useToast } from '@/app/providers/toast-provider';
import { buildShareSummary } from '@/domain/privacy/share-summary';
import { renderShareLines, renderShareText } from '@/features/actions/share-text';
import { copyText } from '@/lib/clipboard';

export default function SharePage() {
  const { t, locale } = useLocale();
  const { claim, result } = useOffer();
  const { showToast } = useToast();

  const summary = useMemo(
    () => (result ? buildShareSummary(claim, result) : null),
    [claim, result],
  );
  const lines = useMemo(
    () => (summary ? renderShareLines(locale, summary) : []),
    [locale, summary],
  );

  if (!summary) {
    return (
      <div className="pb-8">
        <ScreenHeader titleKey="share.title" backHref="/periksa" />
        <div className="flex flex-col gap-4 px-4 py-4">
          <Notice tone="info" title={t('result.no_state_title')} role="status">
            {t('result.no_state_body')}
          </Notice>
          <LinkButton href="/periksa">{t('result.no_state_cta')}</LinkButton>
        </div>
      </div>
    );
  }

  const handleCopy = async () => {
    // Built from the redacted view model only — never from application state.
    const copied = await copyText(renderShareText(locale, summary));
    showToast(copied ? t('share.copied') : t('message.copy_failed'));
  };

  return (
    <div className="pb-8">
      <ScreenHeader
        titleKey="share.title"
        backHref="/hasil"
        showDemoBadge={summary.isDemo}
      />

      <div className="flex flex-col gap-4 px-4 py-4">
        <Notice tone="match">{t('share.privacy_note')}</Notice>

        <h2 className="text-xs font-bold tracking-wide text-text-muted uppercase">
          {t('share.preview_label')}
        </h2>
        <div
          className="flex flex-col gap-1.5 rounded-card border border-border-default bg-surface-card p-4 text-[13px] leading-relaxed text-text-secondary"
          data-testid="share-preview"
        >
          {lines.map((line, index) => (
            <p key={index} className={index === 0 ? 'font-bold text-text-primary' : ''}>
              {line}
            </p>
          ))}
        </div>

        <Notice tone="info">{t('share.share_warning')}</Notice>

        <Button onClick={() => void handleCopy()}>
          <Icon name="share" size={18} />
          {t('share.copy')}
        </Button>
      </div>
    </div>
  );
}
