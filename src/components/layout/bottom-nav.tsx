'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon, type IconName } from '@/components/ui/icon';
import { useLocale } from '@/app/providers/locale-provider';
import type { MessageKey } from '@/content/locales/message-key';

interface NavItem {
  readonly href: string;
  readonly labelKey: MessageKey;
  readonly icon: IconName;
  /** Routes that keep this tab active. */
  readonly group: readonly string[];
}

const NAV_ITEMS: readonly NavItem[] = [
  { href: '/', labelKey: 'nav.home', icon: 'home', group: ['/'] },
  {
    href: '/periksa',
    labelKey: 'nav.check',
    icon: 'search',
    group: ['/periksa', '/konfirmasi', '/hasil', '/kanal', '/pesan', '/bagikan'],
  },
  {
    href: '/latihan',
    labelKey: 'nav.learn',
    icon: 'graduation',
    group: ['/latihan', '/latihan/simulasi', '/latihan/pola', '/skenario'],
  },
  { href: '/riwayat', labelKey: 'nav.history', icon: 'clock', group: ['/riwayat'] },
];

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useLocale();

  return (
    <nav
      aria-label={t('nav.label')}
      className="shrink-0 bg-brand-dark pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="flex items-center justify-around px-1 py-2">
        {NAV_ITEMS.map((item) => {
          const isActive = item.group.includes(pathname);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`flex min-h-11 min-w-11 flex-col items-center gap-1 rounded-lg px-3 py-1 ${
                  isActive ? 'text-brand-accent' : 'text-white/60'
                }`}
              >
                <Icon name={item.icon} size={23} />
                <span className="text-[11px] font-semibold">{t(item.labelKey)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
