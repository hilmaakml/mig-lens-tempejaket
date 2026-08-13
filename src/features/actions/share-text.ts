import type { Locale } from '@/content/locales/locale';
import { formatDate, translate } from '@/content/locales/translate';
import { CATEGORY_LABEL_KEY, STATUS_LABEL_KEY } from '@/domain/evidence/evidence-item';
import type { RedactedShareSummary } from '@/domain/privacy/share-summary';

/**
 * Renders the redacted share summary. It reads only `RedactedShareSummary`, never the
 * offer claim or the verification result, so nothing outside the allowlist can reach the
 * preview or the clipboard (SECURITY.md 7).
 */
export function renderShareLines(
  locale: Locale,
  summary: RedactedShareSummary,
): readonly string[] {
  const lines: string[] = [];

  lines.push(
    translate(locale, 'share.recommendation', {
      recommendation: translate(
        locale,
        `result.recommendation.${summary.recommendation}.headline`,
      ),
    }),
  );

  if (summary.position) {
    lines.push(translate(locale, 'share.position', { position: summary.position }));
  }
  if (summary.destinationCountry) {
    lines.push(
      translate(locale, 'share.country', { country: summary.destinationCountry }),
    );
  }
  if (summary.maskedContact) {
    lines.push(translate(locale, 'share.contact', { contact: summary.maskedContact }));
  }

  for (const entry of summary.categories) {
    lines.push(
      translate(locale, 'share.category_line', {
        category: translate(locale, CATEGORY_LABEL_KEY[entry.category]),
        status: translate(locale, STATUS_LABEL_KEY[entry.status]),
      }),
    );
  }

  lines.push(translate(locale, 'share.indicators', { count: summary.indicatorCount }));
  lines.push(
    translate(locale, 'share.checked_at', {
      date: formatDate(locale, summary.checkedAt),
    }),
  );

  for (const source of summary.sources) {
    if (source.url) lines.push(`${translate(locale, source.nameKey)}: ${source.url}`);
  }

  lines.push(translate(locale, 'result.limitation'));
  if (summary.isDemo) lines.push(translate(locale, 'app.demo_badge'));
  lines.push(translate(locale, 'share.footer'));

  return lines;
}

export function renderShareText(locale: Locale, summary: RedactedShareSummary): string {
  return renderShareLines(locale, summary).join('\n');
}
