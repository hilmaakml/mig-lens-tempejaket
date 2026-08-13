'use client';

import Link from 'next/link';
import { ScreenHeader } from '@/components/layout/screen-header';
import { LinkButton } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Notice } from '@/components/ui/notice';
import { useLocale } from '@/app/providers/locale-provider';
import { useOffer } from '@/app/providers/offer-provider';
import { mapExercise } from '@/domain/learning/exercise-mapping';
import { useProgress, type ExerciseProgress } from '@/features/progress/use-progress';

export default function LearningPage() {
  const { t } = useLocale();
  const { result } = useOffer();
  const { exerciseProgress } = useProgress();

  const recommendedId = result ? mapExercise(result.items) : null;
  // Every exercise is listed. One without a scenario yet is shown as unavailable rather
  // than hidden, so the recommendation from the result screen always has a matching card.
  const recommended = exerciseProgress.filter(
    (entry) => entry.exercise.id === recommendedId,
  );
  const others = exerciseProgress.filter((entry) => entry.exercise.id !== recommendedId);

  return (
    <div className="pb-8">
      <ScreenHeader titleKey="learn.title" backHref="/" />

      <div className="flex flex-col gap-4 px-4 py-4">
        <Notice tone="match">
          {result ? t('learn.intro') : t('learn.intro_no_result')}
        </Notice>

        {recommended.length > 0 ? (
          <>
            <h2 className="text-xs font-bold tracking-wide text-text-muted uppercase">
              {t('learn.recommended_for_you')}
            </h2>
            <ul className="flex flex-col gap-2.5">
              {recommended.map((entry) => (
                <li key={entry.exercise.id}>
                  <ExerciseLink entry={entry} />
                </li>
              ))}
            </ul>
          </>
        ) : null}

        <h2 className="text-xs font-bold tracking-wide text-text-muted uppercase">
          {t('learn.all_exercises')}
        </h2>
        <ul className="flex flex-col gap-2.5">
          {others.map((entry) => (
            <li key={entry.exercise.id}>
              <ExerciseLink entry={entry} />
            </li>
          ))}
        </ul>

        <LinkButton href="/latihan/pola" variant="secondary">
          {t('learn.pattern_cta')}
        </LinkButton>
      </div>
    </div>
  );
}

function ExerciseLink({ entry }: { readonly entry: ExerciseProgress }) {
  const { t } = useLocale();
  const isAvailable = entry.total > 0;

  const body = (
    <>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-unknown-bg text-brand-primary">
        <Icon name="graduation" size={20} />
      </span>
      <span className="flex-1">
        <span className="block text-[14.5px] font-bold text-text-primary">
          {t(entry.exercise.titleKey)}
        </span>
        <span className="mt-0.5 block text-xs leading-snug text-text-muted">
          {t(entry.exercise.reasonKey)}
        </span>
        <span
          className={`mt-1 block text-xs font-semibold ${
            isAvailable ? 'text-brand-primary-strong' : 'text-text-muted'
          }`}
        >
          {isAvailable
            ? t('learn.progress_label', { done: entry.done, total: entry.total })
            : t('learn.no_scenario_yet')}
        </span>
      </span>
      {isAvailable ? (
        <Icon name="chevron-right" size={19} className="text-border-strong" />
      ) : null}
    </>
  );

  const className =
    'flex items-center gap-3 rounded-card border border-border-default bg-surface-card p-4';

  // An exercise with no scenario is not a link: it would be a dead end.
  return isAvailable ? (
    <Link href="/latihan/simulasi" className={className}>
      {body}
    </Link>
  ) : (
    <div className={`${className} opacity-70`}>{body}</div>
  );
}
