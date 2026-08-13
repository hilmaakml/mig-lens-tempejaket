'use client';

import { ScreenHeader } from '@/components/layout/screen-header';
import { LinkButton } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Notice } from '@/components/ui/notice';
import { ExternalSourceLink } from '@/features/actions/external-source-link';
import { useLocale } from '@/app/providers/locale-provider';
import { useOffer } from '@/app/providers/offer-provider';
import { buildComplaintChannelViews } from '@/domain/actions/complaint-channels';
import { getOpenableUrl, getSource } from '@/domain/sources/source-registry';

const VERIFICATION_SOURCE_IDS = [
  'siskop2mi-p3mi',
  'siskop2mi-vacancies',
  'siskop2mi-sanctions',
  'permen-17-2025',
] as const;

export default function OfficialChannelsPage() {
  const { t } = useLocale();
  const { result } = useOffer();

  const channels = buildComplaintChannelViews(result?.items ?? []);
  const recommended = channels.filter((view) => view.isRecommended);
  const others = channels.filter((view) => !view.isRecommended);

  return (
    <div className="pb-8">
      <ScreenHeader titleKey="channels.title" backHref={result ? '/hasil' : '/'} />

      <div className="flex flex-col gap-4 px-4 py-4">
        <Notice tone="info">{t('channels.intro')}</Notice>

        <h2 className="text-xs font-bold tracking-wide text-text-muted uppercase">
          {t('channels.section_verify')}
        </h2>
        <div className="flex flex-col gap-2.5">
          {VERIFICATION_SOURCE_IDS.map((sourceId) => {
            const entry = getSource(sourceId);
            const url = getOpenableUrl(sourceId);
            if (!entry) return null;
            return (
              <section
                key={sourceId}
                className="rounded-card border border-border-default bg-surface-card p-4"
              >
                <h3 className="text-[14.5px] font-bold text-text-primary">
                  {t(entry.nameKey)}
                </h3>
                <p className="mt-1 text-[12.5px] leading-snug text-text-muted">
                  {t(entry.purposeKey)}
                </p>
                <p className="mt-2 text-[12px] leading-snug text-text-secondary">
                  {t(entry.limitationKey)}
                </p>
                {url ? (
                  <div className="mt-3">
                    <ExternalSourceLink url={url} label={t(entry.nameKey)} />
                  </div>
                ) : (
                  <p className="mt-3 text-[12.5px] font-semibold text-text-muted">
                    {t('source.not_available')}
                  </p>
                )}
              </section>
            );
          })}

          <section className="rounded-card border border-border-default bg-surface-card p-4">
            <h3 className="text-[14.5px] font-bold text-text-primary">
              {t('channels.official_contact_title')}
            </h3>
            <p className="mt-1 text-[12.5px] leading-snug text-text-muted">
              {t('channels.official_contact_body')}
            </p>
            {/* No approved source record supplies a contact in this build, so no phone
                number is invented and the offer's own number is never offered here. */}
            <p className="mt-2 text-[12.5px] leading-snug text-text-secondary">
              {t('channels.official_contact_unavailable')}
            </p>
          </section>
        </div>

        <h2
          id="pengaduan"
          className="scroll-mt-16 text-xs font-bold tracking-wide text-text-muted uppercase"
        >
          {t('channels.section_complaint')}
        </h2>
        <Notice tone="warning">{t('channels.handoff_notice')}</Notice>
        <Notice tone="match">{t('channels.no_data_transmitted')}</Notice>

        <div className="flex flex-col gap-2.5">
          {[...recommended, ...others].map((view) => (
            <section
              key={view.channel.id}
              className="rounded-card border border-border-default bg-surface-card p-4"
              data-channel={view.channel.id}
            >
              {view.isRecommended ? (
                <p className="mb-2 inline-flex items-center gap-1.5 rounded-md border border-match-border bg-match-bg px-2 py-1 text-[10.5px] font-bold text-match-text">
                  <Icon name="check" size={12} strokeWidth={2.4} />
                  {t('channels.recommended')}
                </p>
              ) : null}
              <h3 className="text-[14.5px] font-bold text-text-primary">
                {t(view.sourceNameKey)}
              </h3>
              {view.recommendationReasonKey ? (
                <p className="mt-1 text-[12.5px] leading-snug text-text-secondary">
                  {t(view.recommendationReasonKey)}
                </p>
              ) : null}

              <dl className="mt-3 flex flex-col gap-2 text-[12.5px] leading-relaxed text-text-secondary">
                <div>
                  <dt className="font-bold text-text-primary">
                    {t('channels.report_object')}
                  </dt>
                  <dd>{t(view.channel.reportObjectKey)}</dd>
                </div>
                <div>
                  <dt className="font-bold text-text-primary">{t('channels.why')}</dt>
                  <dd>{t(view.channel.whyRelevantKey)}</dd>
                </div>
                <div>
                  <dt className="font-bold text-text-primary">
                    {t('channels.evidence_hint')}
                  </dt>
                  <dd>{t(view.channel.evidenceHintKey)}</dd>
                </div>
                <div>
                  <dt className="font-bold text-text-primary">
                    {t('channels.limitation')}
                  </dt>
                  <dd>{t(view.channel.limitationKey)}</dd>
                </div>
              </dl>

              {view.url ? (
                <div className="mt-3">
                  <ExternalSourceLink url={view.url} label={t(view.sourceNameKey)} />
                </div>
              ) : (
                <div className="mt-3 rounded-xl border border-unknown-border bg-unknown-bg p-3">
                  <p className="text-[12.5px] font-bold text-text-primary">
                    {t('channels.unavailable_title')}
                  </p>
                  <p className="mt-1 text-[12px] leading-relaxed text-text-secondary">
                    {t('channels.unavailable_body')}
                  </p>
                  {view.alternative?.url ? (
                    <div className="mt-2">
                      <p className="mb-1 text-[12px] font-bold text-text-primary">
                        {t('channels.alternative')}
                      </p>
                      <ExternalSourceLink
                        url={view.alternative.url}
                        label={t(view.alternative.nameKey)}
                      />
                    </div>
                  ) : null}
                </div>
              )}
            </section>
          ))}
        </div>

        <LinkButton href="/pesan">{t('result.action_message')}</LinkButton>
      </div>
    </div>
  );
}
