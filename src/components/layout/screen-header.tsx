'use client';

import { useRouter } from 'next/navigation';
import { Icon } from '@/components/ui/icon';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { GuideLink } from '@/components/layout/guide-link';
import { useLocale } from '@/app/providers/locale-provider';
import type { MessageKey } from '@/content/locales/message-key';

interface ScreenHeaderProps {
  readonly titleKey: MessageKey;
  /** Route the back control returns to. Omit to hide the back control. */
  readonly backHref?: string;
  readonly showDemoBadge?: boolean;
  /** The Guide screen itself hides the control that opens it. */
  readonly hideGuideLink?: boolean;
}

/**
 * Sticky screen header with a predictable back action and the language control in a
 * consistent position on every public screen (DESIGN.md 2).
 */
export function ScreenHeader({
  titleKey,
  backHref,
  showDemoBadge,
  hideGuideLink,
}: ScreenHeaderProps) {
  const router = useRouter();
  const { t } = useLocale();

  return (
    <header className="sticky top-0 z-20 flex items-center gap-2 border-b border-border-default bg-surface-app/95 px-3 py-2 backdrop-blur">
      {backHref ? (
        <button
          type="button"
          onClick={() => router.push(backHref)}
          aria-label={t('app.back')}
          className="flex size-11 shrink-0 items-center justify-center rounded-xl text-text-primary"
        >
          <Icon name="chevron-left" size={23} />
        </button>
      ) : null}
      <h1 className="min-w-0 flex-1 truncate text-base font-bold text-text-primary">
        {t(titleKey)}
      </h1>
      {showDemoBadge ? (
        <span className="shrink-0 rounded-md bg-unknown-bg px-2 py-1 font-mono text-[10px] text-text-muted">
          {t('app.demo_badge_short')}
        </span>
      ) : null}
      {hideGuideLink ? null : <GuideLink />}
      <LanguageSwitcher />
    </header>
  );
}
