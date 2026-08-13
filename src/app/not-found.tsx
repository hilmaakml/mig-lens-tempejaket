'use client';

import { LinkButton } from '@/components/ui/button';
import { Notice } from '@/components/ui/notice';
import { useLocale } from '@/app/providers/locale-provider';

export default function NotFound() {
  const { t } = useLocale();
  return (
    <div className="flex flex-col gap-4 px-4 py-8">
      <h1 className="text-lg font-extrabold text-text-primary">
        {t('error.not_found_title')}
      </h1>
      <Notice tone="info">{t('error.not_found_body')}</Notice>
      <LinkButton href="/">{t('error.go_home')}</LinkButton>
    </div>
  );
}
