import type { EvidenceItem } from '@/domain/evidence/evidence-item';
import type { MessageKey } from '@/content/locales/message-key';

/**
 * Personal exercise mapping (PRD FR-14). One exercise is recommended, chosen from the
 * unresolved item highest in the PRD's priority table. Progress is an explainable count —
 * never an immunity score or percentage.
 */

export type ExerciseId =
  | 'institution-identity-misuse'
  | 'urgency-and-time-pressure'
  | 'asking-for-written-evidence'
  | 'checking-payment-destination';

export interface Exercise {
  readonly id: ExerciseId;
  readonly titleKey: MessageKey;
  readonly reasonKey: MessageKey;
}

/**
 * The exercise catalogue carries no progress numbers. Counts come from what the user has
 * actually completed (`domain/progress`) measured against the scenarios that actually
 * exist (`domain/learning/scenarios`), so a new visitor starts at zero.
 */
export const EXERCISES: readonly Exercise[] = [
  {
    id: 'institution-identity-misuse',
    titleKey: 'exercise.identity_misuse.title',
    reasonKey: 'exercise.identity_misuse.reason',
  },
  {
    id: 'urgency-and-time-pressure',
    titleKey: 'exercise.urgency.title',
    reasonKey: 'exercise.urgency.reason',
  },
  {
    id: 'asking-for-written-evidence',
    titleKey: 'exercise.written_evidence.title',
    reasonKey: 'exercise.written_evidence.reason',
  },
  {
    id: 'checking-payment-destination',
    titleKey: 'exercise.payment_destination.title',
    reasonKey: 'exercise.payment_destination.reason',
  },
];

/** Core verification steps the readiness count is measured against (PRD FR-14). */
export const CORE_VERIFICATION_STEPS = 5;

export const getExercise = (id: ExerciseId): Exercise => {
  const found = EXERCISES.find((exercise) => exercise.id === id);
  if (!found) throw new Error(`Unknown exercise id: ${id}`);
  return found;
};

/** Priority order follows the PRD FR-14 trigger table. */
export function mapExercise(items: readonly EvidenceItem[]): ExerciseId | null {
  const has = (predicate: (item: EvidenceItem) => boolean) => items.some(predicate);

  if (has((item) => item.category === 'contact' && item.status !== 'source_match')) {
    return 'institution-identity-misuse';
  }
  if (
    has(
      (item) =>
        item.ruleId === 'TIME_PRESSURE_IMMEDIATE_TRANSFER' &&
        item.status === 'risk_indicator',
    )
  ) {
    return 'urgency-and-time-pressure';
  }
  if (has((item) => item.category === 'contract' && item.status !== 'source_match')) {
    return 'asking-for-written-evidence';
  }
  if (
    has(
      (item) =>
        item.ruleId === 'PAYMENT_PERSONAL_ACCOUNT_UNVERIFIED' &&
        item.status === 'risk_indicator',
    )
  ) {
    return 'checking-payment-destination';
  }
  return null;
}
