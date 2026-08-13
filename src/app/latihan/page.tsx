'use client';

import Link from 'next/link';
import { ScreenHeader } from '@/components/layout/screen-header';
import { LinkButton } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Notice } from '@/components/ui/notice';
import { useLocale } from '@/app/providers/locale-provider';
import { useOffer } from '@/app/providers/offer-provider';
import { EXERCISES, mapExercise } from '@/domain/learning/exercise-mapping';

export default function LearningPage() {
  const { t } = useLocale();
  const { result } = useOffer();

  const recommendedId = result ? mapExercise(result.items) : null;
  const recommended = EXERCISES.filter((exercise) => exercise.id === recommendedId);
  const others = EXERCISES.filter((exercise) => exercise.id !== recommendedId);

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
              {recommended.map((exercise) => (
                <li key={exercise.id}>
                  <ExerciseLink
                    titleKey={exercise.titleKey}
                    reasonKey={exercise.reasonKey}
                    recognised={exercise.recognised}
                    total={exercise.total}
                  />
                </li>
              ))}
            </ul>
          </>
        ) : null}

        <h2 className="text-xs font-bold tracking-wide text-text-muted uppercase">
          {t('learn.all_exercises')}
        </h2>
        <ul className="flex flex-col gap-2.5">
          {others.map((exercise) => (
            <li key={exercise.id}>
              <ExerciseLink
                titleKey={exercise.titleKey}
                reasonKey={exercise.reasonKey}
                recognised={exercise.recognised}
                total={exercise.total}
              />
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

function ExerciseLink({
  titleKey,
  reasonKey,
  recognised,
  total,
}: {
  readonly titleKey: Parameters<ReturnType<typeof useLocale>['t']>[0];
  readonly reasonKey: Parameters<ReturnType<typeof useLocale>['t']>[0];
  readonly recognised: number;
  readonly total: number;
}) {
  const { t } = useLocale();
  return (
    <Link
      href="/latihan/simulasi"
      className="flex items-center gap-3 rounded-card border border-border-default bg-surface-card p-4"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-unknown-bg text-brand-primary">
        <Icon name="graduation" size={20} />
      </span>
      <span className="flex-1">
        <span className="block text-[14.5px] font-bold text-text-primary">
          {t(titleKey)}
        </span>
        <span className="mt-0.5 block text-xs leading-snug text-text-muted">
          {t(reasonKey)}
        </span>
        <span className="mt-1 block text-xs font-semibold text-brand-primary-strong">
          {t('learn.progress_label', { done: recognised, total })}
        </span>
      </span>
      <Icon name="chevron-right" size={19} className="text-border-strong" />
    </Link>
  );
}
