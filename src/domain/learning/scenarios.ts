import type { MessageKey } from '@/content/locales/message-key';
import type { ExerciseId } from '@/domain/learning/exercise-mapping';

/**
 * Catalogue of the practice scenarios that actually exist in the application.
 *
 * Progress denominators are derived from this list, never from a hard-coded number: if a
 * scenario is added or removed, every "x dari y" count follows automatically.
 */

export interface ScenarioOption {
  readonly id: string;
  readonly textKey: MessageKey;
  /** The response that pauses and asks for evidence instead of acting under pressure. */
  readonly isSafe: boolean;
}

export interface Scenario {
  readonly id: string;
  /** Which exercise this scenario trains. Used to credit progress on a correct answer. */
  readonly exerciseId: ExerciseId;
  readonly scenarioKey: MessageKey;
  readonly messageKey: MessageKey;
  readonly tacticKeys: readonly MessageKey[];
  readonly options: readonly ScenarioOption[];
}

export const SCENARIOS: readonly Scenario[] = [
  {
    id: 'caregiver-taiwan-urgency',
    exerciseId: 'urgency-and-time-pressure',
    scenarioKey: 'sim.scenario',
    messageKey: 'sim.message',
    tacticKeys: ['sim.tactic_authority', 'sim.tactic_urgency'],
    options: [
      { id: 'transfer', textKey: 'sim.option_transfer', isSafe: false },
      { id: 'verify', textKey: 'sim.option_verify', isSafe: true },
      { id: 'negotiate', textKey: 'sim.option_negotiate', isSafe: false },
    ],
  },
];

export const TOTAL_SCENARIO_COUNT = SCENARIOS.length;

export function getScenario(id: string): Scenario | undefined {
  return SCENARIOS.find((scenario) => scenario.id === id);
}

/** Scenarios that train a given exercise. An exercise with none is not yet practisable. */
export function scenariosForExercise(exerciseId: ExerciseId): readonly Scenario[] {
  return SCENARIOS.filter((scenario) => scenario.exerciseId === exerciseId);
}

/** The scenario a "start this exercise" link should open, when one exists. */
export function firstScenarioForExercise(exerciseId: ExerciseId): Scenario | undefined {
  return scenariosForExercise(exerciseId)[0];
}
