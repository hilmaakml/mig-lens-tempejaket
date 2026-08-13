'use client';

import { ScreenHeader } from '@/components/layout/screen-header';
import { Button, LinkButton } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { useLocale } from '@/app/providers/locale-provider';
import { useOffer } from '@/app/providers/offer-provider';
import { useToast } from '@/app/providers/toast-provider';
import { copyText } from '@/lib/clipboard';

export default function VerificationMessagePage() {
  const { t } = useLocale();
  const { result } = useOffer();
  const { showToast } = useToast();

  // The template is fixed reviewed copy: it contains no offer content, no name, and no
  // number, so copying it can never leak the user's data (PRD FR-12).
  const messageBody = t('message.body');

  const handleCopy = async () => {
    const copied = await copyText(messageBody);
    showToast(copied ? t('message.copied') : t('message.copy_failed'));
  };

  return (
    <div className="pb-8">
      <ScreenHeader titleKey="message.title" backHref={result ? '/hasil' : '/'} />

      <div className="flex flex-col gap-4 px-4 py-4">
        <p className="text-[13.5px] leading-relaxed text-text-secondary">
          {t('message.intro')}
        </p>

        <h2 className="text-xs font-bold tracking-wide text-text-muted uppercase">
          {t('message.preview_label')}
        </h2>
        <blockquote className="rounded-card border border-border-default bg-surface-card p-4 text-sm leading-relaxed text-text-primary">
          {messageBody}
        </blockquote>

        <Button onClick={() => void handleCopy()}>
          <Icon name="copy" size={18} />
          {t('message.copy')}
        </Button>
        <LinkButton href="/kanal" variant="secondary">
          {t('message.view_channels')}
        </LinkButton>
      </div>
    </div>
  );
}
