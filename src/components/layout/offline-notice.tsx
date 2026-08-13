'use client';

import { useSyncExternalStore } from 'react';
import { Icon } from '@/components/ui/icon';
import { useLocale } from '@/app/providers/locale-provider';

function subscribe(onChange: () => void) {
  window.addEventListener('online', onChange);
  window.addEventListener('offline', onChange);
  return () => {
    window.removeEventListener('online', onChange);
    window.removeEventListener('offline', onChange);
  };
}

/**
 * Offline banner (DESIGN.md 9, PRD FR-15). It explains that checks needing an official
 * source have to wait, and it never reconstructs or displays offer data.
 */
export function OfflineNotice() {
  const { t } = useLocale();
  const isOnline = useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true,
  );

  if (isOnline) return null;

  return (
    <div
      role="status"
      className="flex items-start gap-2 border-b border-unknown-border bg-unknown-bg px-4 py-2 text-[12.5px] leading-snug text-text-secondary"
    >
      <Icon name="info" size={16} className="mt-0.5 shrink-0" />
      <span>
        <strong className="font-bold">{t('offline.title')}</strong> {t('offline.body')}
      </span>
    </div>
  );
}
