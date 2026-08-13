'use client';

import { useState } from 'react';
import { ScreenHeader } from '@/components/layout/screen-header';
import { Button, LinkButton } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { useLocale } from '@/app/providers/locale-provider';
import { useProgress } from '@/features/progress/use-progress';
import { SCENARIOS } from '@/domain/learning/scenarios';

export default function SimulationPage() {
  const { t } = useLocale();
  const { recordScenarioCompleted } = useProgress();
  const [chosenId, setChosenId] = useState<string | null>(null);

  // The catalogue currently holds one scenario; the screen renders whichever is first.
  const scenario = SCENARIOS[0];
  const options = scenario?.options ?? [];
  const chosen = options.find((option) => option.id === chosenId) ?? null;

  const handleChoose = (optionId: string) => {
    setChosenId(optionId);
    const option = options.find((entry) => entry.id === optionId);
    // Only a safe answer earns progress, and the store ignores a repeat of the same
    // scenario, so replaying it cannot inflate the count.
    if (scenario && option?.isSafe) recordScenarioCompleted(scenario.id);
  };

  return (
    <div className="pb-8">
      <ScreenHeader titleKey="sim.title" backHref="/latihan" />

      <div className="flex flex-col gap-4 px-4 py-4">
        <p className="self-start rounded-full border border-border-default bg-unknown-bg px-3 py-1.5 text-xs font-semibold text-text-secondary">
          {t('sim.scenario')}
        </p>

        <div className="flex items-end gap-2.5">
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-border-default text-text-muted"
            aria-hidden="true"
          >
            <Icon name="user" size={19} />
          </span>
          <p className="max-w-[86%] rounded-[4px_17px_17px_17px] border border-border-default bg-surface-card px-4 py-3 text-[14.5px] leading-relaxed text-text-primary">
            {t('sim.message')}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 pl-11">
          <Tag icon="user" label={t('sim.tactic_authority')} />
          <Tag icon="bolt" label={t('sim.tactic_urgency')} />
        </div>

        {!chosen ? (
          <div className="flex flex-col gap-2.5">
            <p className="rounded-card border border-match-border bg-match-bg px-4 py-3 text-[14.5px] font-bold text-brand-dark">
              {t('sim.question')}
            </p>
            {options.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => handleChoose(option.id)}
                className="flex min-h-11 w-full items-start gap-3 rounded-button border-[1.5px] border-border-default bg-surface-card px-4 py-3.5 text-left text-sm leading-relaxed text-text-primary"
              >
                <span
                  className="mt-0.5 size-5 shrink-0 rounded-full border-2 border-border-strong"
                  aria-hidden="true"
                />
                <span>{t(option.textKey)}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3" aria-live="polite">
            <p className="max-w-[86%] self-end rounded-[17px_4px_17px_17px] bg-brand-primary px-4 py-3 text-[14.5px] leading-relaxed text-white">
              {t(chosen.textKey)}
            </p>

            {chosen.isSafe ? (
              <section className="rounded-card border border-match-border bg-match-bg p-4">
                <h2 className="flex items-center gap-2 text-[15px] font-bold text-match-text">
                  <Icon name="shield-check" size={21} />
                  {t('sim.safe_title')}
                </h2>
                <p className="mt-2 text-[13.5px] leading-relaxed text-brand-primary-strong">
                  {t('sim.safe_body')}
                </p>
                <div className="mt-4">
                  <LinkButton href="/latihan/pola">{t('sim.see_patterns')}</LinkButton>
                </div>
              </section>
            ) : (
              <section className="rounded-card border border-risk-border bg-risk-bg p-4">
                <h2 className="flex items-center gap-2 text-[15px] font-bold text-risk-text">
                  <Icon name="warning" size={21} />
                  {t('sim.unsafe_title')}
                </h2>
                <p className="mt-2 text-[13.5px] leading-relaxed text-risk-deep">
                  {t('sim.unsafe_body')}
                </p>
                <div className="mt-4">
                  <Button variant="secondary" onClick={() => setChosenId(null)}>
                    {t('sim.retry')}
                  </Button>
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Tag({
  icon,
  label,
}: {
  readonly icon: 'user' | 'bolt';
  readonly label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-risk-border bg-risk-bg px-2.5 py-1.5 font-mono text-[11.5px] font-bold text-risk-text">
      <Icon name={icon} size={13} strokeWidth={2} />
      {label}
    </span>
  );
}
