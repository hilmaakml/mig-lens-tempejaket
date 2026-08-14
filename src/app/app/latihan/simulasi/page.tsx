'use client';

import { useEffect, useState } from 'react';
import { ScreenHeader } from '@/components/layout/screen-header';
import { Button, LinkButton } from '@/components/ui/button';
import { Icon, type IconName } from '@/components/ui/icon';
import { useLocale } from '@/app/providers/locale-provider';
import { useProgress } from '@/features/progress/use-progress';
import { SCENARIOS, getScenario } from '@/domain/learning/scenarios';

export default function SimulationPage() {
  const { t } = useLocale();
  const { recordScenarioCompleted } = useProgress();
  const [scenarioId, setScenarioId] = useState<string | null>(null);
  const [chosenId, setChosenId] = useState<string | null>(null);

  /**
   * A link may point at one particular scenario with `#<scenario-id>` — the reported case
   * screen does. The first render deliberately ignores the fragment so server and client
   * markup match; the selection is applied straight afterwards. An unknown fragment is
   * ignored rather than showing an empty screen.
   */
  useEffect(() => {
    const requested = window.location.hash.replace('#', '');
    if (requested && getScenario(requested)) setScenarioId(requested);
  }, []);

  const scenario = (scenarioId ? getScenario(scenarioId) : undefined) ?? SCENARIOS[0];
  const options = scenario?.options ?? [];
  const chosen = options.find((option) => option.id === chosenId) ?? null;

  const handleChoose = (optionId: string) => {
    setChosenId(optionId);
    const option = options.find((entry) => entry.id === optionId);
    // Only a safe answer earns progress, and the store ignores a repeat of the same
    // scenario, so replaying it cannot inflate the count.
    if (scenario && option?.isSafe) recordScenarioCompleted(scenario.id);
  };

  // Switching scenario starts that one unanswered rather than carrying an answer across.
  const handleSelectScenario = (id: string) => {
    setScenarioId(id);
    setChosenId(null);
  };

  return (
    <div className="pb-8">
      <ScreenHeader titleKey="sim.title" backHref="/app/latihan" />

      <div className="flex flex-col gap-4 px-4 py-4">
        {/* The picker only appears once more than one scenario exists. */}
        {SCENARIOS.length > 1 ? (
          <div
            role="group"
            aria-label={t('sim.pick_scenario')}
            className="flex flex-wrap gap-2"
          >
            {SCENARIOS.map((entry) => {
              const isActive = entry.id === scenario?.id;
              return (
                <button
                  key={entry.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => handleSelectScenario(entry.id)}
                  className={`min-h-11 rounded-full border px-3.5 py-2 text-[12.5px] font-bold transition-colors ${
                    isActive
                      ? 'border-brand-dark bg-brand-dark text-white'
                      : 'border-border-default bg-surface-card text-text-secondary'
                  }`}
                >
                  {t(entry.shortLabelKey)}
                </button>
              );
            })}
          </div>
        ) : null}

        <p className="self-start rounded-full border border-border-default bg-unknown-bg px-3 py-1.5 text-xs font-semibold text-text-secondary">
          {scenario ? t(scenario.scenarioKey) : null}
        </p>

        {/* Provenance for a scenario drawn from reporting, stated before the message. */}
        {scenario?.sourceNoteKey ? (
          <p className="-mt-2 text-[11.5px] leading-snug text-text-faint">
            {t(scenario.sourceNoteKey)}
          </p>
        ) : null}

        <div className="flex items-end gap-2.5">
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-border-default text-text-muted"
            aria-hidden="true"
          >
            <Icon name="user" size={19} />
          </span>
          <p className="max-w-[86%] rounded-[4px_17px_17px_17px] border border-border-default bg-surface-card px-4 py-3 text-[14.5px] leading-relaxed text-text-primary">
            {scenario ? t(scenario.messageKey) : null}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 pl-11">
          {scenario?.tactics.map((tactic) => (
            <Tag key={tactic.labelKey} icon={tactic.icon} label={t(tactic.labelKey)} />
          ))}
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
                  {scenario ? t(scenario.safeTitleKey) : null}
                </h2>
                <p className="mt-2 text-[13.5px] leading-relaxed text-brand-primary-strong">
                  {scenario ? t(scenario.safeBodyKey) : null}
                </p>
                <div className="mt-4">
                  <LinkButton href="/app/latihan/pola">
                    {t('sim.see_patterns')}
                  </LinkButton>
                </div>
              </section>
            ) : (
              <section className="rounded-card border border-risk-border bg-risk-bg p-4">
                <h2 className="flex items-center gap-2 text-[15px] font-bold text-risk-text">
                  <Icon name="warning" size={21} />
                  {scenario ? t(scenario.unsafeTitleKey) : null}
                </h2>
                <p className="mt-2 text-[13.5px] leading-relaxed text-risk-deep">
                  {scenario ? t(scenario.unsafeBodyKey) : null}
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
  readonly icon: IconName;
  readonly label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-risk-border bg-risk-bg px-2.5 py-1.5 font-mono text-[11.5px] font-bold text-risk-text">
      <Icon name={icon} size={13} strokeWidth={2} />
      {label}
    </span>
  );
}
