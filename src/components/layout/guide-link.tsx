'use client';

import Link from 'next/link';
import { Icon } from '@/components/ui/icon';
import { useLocale } from '@/app/providers/locale-provider';

/**
 * Persistent entry point to the reusable Guide (LANDING_PAGE.md section 10).
 *
 * It is a plain link into a route inside the application shell, so opening the Guide never
 * unmounts the providers holding offer state, and it never touches the onboarding flag.
 * The icon is decorative; the accessible name comes from the active language.
 */
export function GuideLink({ className = '' }: { readonly className?: string }) {
  const { t } = useLocale();
  return (
    <Link
      href="/app/panduan"
      aria-label={t('onboarding.guide_label')}
      title={t('onboarding.guide_label')}
      className={`flex size-11 shrink-0 items-center justify-center rounded-xl text-text-secondary ${className}`}
    >
      <Icon name="book" size={20} />
    </Link>
  );
}
