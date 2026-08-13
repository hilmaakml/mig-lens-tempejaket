'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';
import {
  getProgressServerSnapshot,
  getProgressSnapshot,
  recordCheckCompleted,
  recordScenarioCompleted,
  resetProgress,
  subscribeToProgress,
} from '@/domain/progress/progress-store';
import type { HistoryEntry, ProgressState } from '@/domain/progress/progress-state';
import { completedExerciseCount } from '@/domain/progress/progress-state';
import {
  CORE_VERIFICATION_STEPS,
  EXERCISES,
  type Exercise,
  type ExerciseId,
} from '@/domain/learning/exercise-mapping';
import {
  SCENARIOS,
  TOTAL_SCENARIO_COUNT,
  scenariosForExercise,
} from '@/domain/learning/scenarios';

export interface ExerciseProgress {
  readonly exercise: Exercise;
  /** Scenarios of this exercise answered safely. */
  readonly done: number;
  /** Scenarios that exist for this exercise, derived from the catalogue. */
  readonly total: number;
}

export interface ProgressView {
  readonly state: ProgressState;
  /** Distinct exercises practised, out of the core verification steps. */
  readonly readinessDone: number;
  readonly readinessTotal: number;
  readonly scenariosDone: number;
  readonly scenariosTotal: number;
  /** Every exercise, including ones with no scenario yet (`total` is 0). */
  readonly exerciseProgress: readonly ExerciseProgress[];
  /** Exercises that can actually be practised right now. */
  readonly practisableProgress: readonly ExerciseProgress[];
  readonly history: readonly HistoryEntry[];
  readonly hasHistory: boolean;
  readonly recordScenarioCompleted: (scenarioId: string) => void;
  readonly recordCheckCompleted: typeof recordCheckCompleted;
  readonly reset: () => void;
}

const exerciseIdOfScenario = (scenarioId: string): string | undefined =>
  SCENARIOS.find((scenario) => scenario.id === scenarioId)?.exerciseId;

export function useProgress(): ProgressView {
  const state = useSyncExternalStore(
    subscribeToProgress,
    getProgressSnapshot,
    getProgressServerSnapshot,
  );

  const completed = useMemo(
    () => new Set(state.completedScenarioIds),
    [state.completedScenarioIds],
  );

  const exerciseProgress = useMemo<readonly ExerciseProgress[]>(
    () =>
      EXERCISES.map((exercise) => {
        const scenarios = scenariosForExercise(exercise.id as ExerciseId);
        return {
          exercise,
          total: scenarios.length,
          done: scenarios.filter((scenario) => completed.has(scenario.id)).length,
        };
      }),
    [completed],
  );

  const practisableProgress = useMemo(
    () => exerciseProgress.filter((entry) => entry.total > 0),
    [exerciseProgress],
  );

  const reset = useCallback(() => resetProgress(), []);

  return {
    state,
    readinessDone: completedExerciseCount(state, exerciseIdOfScenario),
    readinessTotal: CORE_VERIFICATION_STEPS,
    scenariosDone: exerciseProgress.reduce((sum, entry) => sum + entry.done, 0),
    scenariosTotal: TOTAL_SCENARIO_COUNT,
    exerciseProgress,
    practisableProgress,
    history: state.history,
    hasHistory: state.history.length > 0,
    recordScenarioCompleted,
    recordCheckCompleted,
    reset,
  };
}
