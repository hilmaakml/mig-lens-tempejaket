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
  { href: '/app', labelKey: 'nav.home', icon: 'home', group: ['/app'] },
  {
    href: '/app/periksa',
    labelKey: 'nav.check',
    icon: 'search',
    group: [
      '/app/periksa',
      '/app/konfirmasi',
      '/app/hasil',
      '/app/kanal',
      '/app/pesan',
      '/app/bagikan',
    ],
  },
  {
    href: '/app/latihan',
    labelKey: 'nav.learn',
    icon: 'graduation',
    group: [
      '/app/latihan',
      '/app/latihan/simulasi',
      '/app/latihan/pola',
      '/app/skenario',
    ],
  },
  {
    href: '/app/riwayat',
    labelKey: 'nav.history',
    icon: 'clock',
    group: ['/app/riwayat'],
  },
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
