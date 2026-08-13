'use client';

import { useLocale } from '@/app/providers/locale-provider';
import { LOCALES, LOCALE_LABELS, type Locale } from '@/content/locales/locale';

/**
 * Compact ID / EN control (DESIGN.md 2). It is a radio group so screen readers announce the
 * selected language, and it never uses a flag: language is not nationality.
 */
export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLocale();

  const fullName = (value: Locale) =>
    value === 'id' ? t('app.language_indonesian') : t('app.language_english');

  return (
    <div
      role="radiogroup"
      aria-label={t('app.language_picker')}
      className="flex shrink-0 items-center gap-0.5 rounded-full border border-border-default bg-surface-card p-0.5"
    >
      {LOCALES.map((value) => {
        const isSelected = value === locale;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={fullName(value)}
            onClick={() => setLocale(value)}
            className={`min-h-11 min-w-11 rounded-full px-3 text-[13px] font-bold transition-colors ${
              isSelected
                ? 'bg-brand-primary text-white'
                : 'bg-transparent text-text-secondary'
            }`}
          >
            {LOCALE_LABELS[value]}
          </button>
        );
      })}
    </div>
  );
}
