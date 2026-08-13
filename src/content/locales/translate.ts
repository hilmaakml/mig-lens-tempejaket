import { enMessages } from '@/content/locales/en';
import { idMessages } from '@/content/locales/id';
import { LOCALE_TAGS, type Locale } from '@/content/locales/locale';
import type { MessageKey, MessageParams } from '@/content/locales/message-key';

export const CATALOGS: Readonly<Record<Locale, Record<MessageKey, string>>> = {
  id: idMessages,
  en: enMessages,
};

const PLACEHOLDER = /\{(\w+)\}/g;

/**
 * Interpolates `{name}` placeholders. A missing parameter leaves the placeholder visible
 * so a broken message is caught in tests rather than silently rendering an empty string.
 */
export function translate(
  locale: Locale,
  key: MessageKey,
  params?: MessageParams,
): string {
  const template = CATALOGS[locale][key];
  if (!params) return template;
  return template.replace(PLACEHOLDER, (match, name: string) => {
    const value = params[name];
    return value === undefined ? match : String(value);
  });
}

/** Timestamps are stored as UTC ISO strings and formatted for Asia/Jakarta only here. */
export function formatDate(locale: Locale, isoDate: string | null): string {
  if (!isoDate) return '—';
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return '—';
  return new Intl.DateTimeFormat(LOCALE_TAGS[locale], {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(parsed);
}

export function formatDateTime(locale: Locale, isoDate: string | null): string {
  if (!isoDate) return '—';
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return '—';
  return new Intl.DateTimeFormat(LOCALE_TAGS[locale], {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
    timeZoneName: 'short',
  }).format(parsed);
}

export function formatNumber(locale: Locale, value: number): string {
  return new Intl.NumberFormat(LOCALE_TAGS[locale]).format(value);
}
