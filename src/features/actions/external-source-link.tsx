'use client';

import { Icon } from '@/components/ui/icon';
import { useLocale } from '@/app/providers/locale-provider';
import { getDomainLabel, isAllowlistedUrl } from '@/domain/sources/source-registry';

interface ExternalSourceLinkProps {
  readonly url: string;
  readonly label: string;
}

/**
 * External navigation always shows the destination domain first and only renders when the
 * URL is on the approved registry allowlist (SECURITY.md 9, PRD FR-12).
 *
 * The href is the registry URL verbatim: no offer content, identifier, or result is ever
 * appended as a query string or fragment.
 */
export function ExternalSourceLink({ url, label }: ExternalSourceLinkProps) {
  const { t } = useLocale();
  if (!isAllowlistedUrl(url)) return null;
  const domain = getDomainLabel(url);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer external"
      className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border-strong px-3 py-2 text-[13px] font-bold text-brand-dark"
    >
      <Icon name="external" size={16} />
      <span className="min-w-0">
        {t('source.open_external', { name: label })}
        {domain ? (
          <span className="block font-mono text-[10.5px] font-medium text-text-muted">
            {t('source.destination_domain', { domain })}
          </span>
        ) : null}
      </span>
    </a>
  );
}
