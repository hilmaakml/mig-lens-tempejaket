import type { MessageKey } from '@/content/locales/message-key';
import type { ExerciseId } from '@/domain/learning/exercise-mapping';
import type { IconName } from '@/components/ui/icon';

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

/** A named manipulation tactic, shown as a tag beside the recruiter message. */
export interface ScenarioTactic {
  readonly labelKey: MessageKey;
  readonly icon: IconName;
}

export interface Scenario {
  readonly id: string;
  /** Which exercise this scenario trains. Used to credit progress on a correct answer. */
  readonly exerciseId: ExerciseId;
  readonly scenarioKey: MessageKey;
  /** Short label for the scenario picker, where the full scenario line is too long. */
  readonly shortLabelKey: MessageKey;
  readonly messageKey: MessageKey;
  readonly tactics: readonly ScenarioTactic[];
  readonly options: readonly ScenarioOption[];
  readonly safeTitleKey: MessageKey;
  readonly safeBodyKey: MessageKey;
  readonly unsafeTitleKey: MessageKey;
  readonly unsafeBodyKey: MessageKey;
  /**
   * Set when the scenario is drawn from published reporting rather than being a composite.
   * The screen must then say where the pattern comes from (PRD 11.3).
   */
  readonly sourceNoteKey?: MessageKey;
}

export const SCENARIOS: readonly Scenario[] = [
  {
    id: 'caregiver-taiwan-urgency',
    exerciseId: 'urgency-and-time-pressure',
    scenarioKey: 'sim.scenario',
    shortLabelKey: 'sim.short_label',
    messageKey: 'sim.message',
    tactics: [
      { labelKey: 'sim.tactic_authority', icon: 'user' },
      { labelKey: 'sim.tactic_urgency', icon: 'bolt' },
    ],
    options: [
      { id: 'transfer', textKey: 'sim.option_transfer', isSafe: false },
      { id: 'verify', textKey: 'sim.option_verify', isSafe: true },
      { id: 'negotiate', textKey: 'sim.option_negotiate', isSafe: false },
    ],
    safeTitleKey: 'sim.safe_title',
    safeBodyKey: 'sim.safe_body',
    unsafeTitleKey: 'sim.unsafe_title',
    unsafeBodyKey: 'sim.unsafe_body',
  },
  {
    /**
     * Built from the pattern in the reported case on `/app/skenario`: an offer whose
     * country and role change before departure, travelled on a visitor passport, with a
     * large fee due against a rushed date. The wording is a practice reconstruction, not a
     * quotation of anything the person interviewed was told.
     */
    id: 'offer-switched-country',
    exerciseId: 'asking-for-written-evidence',
    scenarioKey: 'sim.switch.scenario',
    shortLabelKey: 'sim.switch.short_label',
    messageKey: 'sim.switch.message',
    tactics: [
      { labelKey: 'sim.switch.tactic_switch', icon: 'file' },
      { labelKey: 'sim.switch.tactic_document', icon: 'card' },
      { labelKey: 'sim.switch.tactic_urgency', icon: 'bolt' },
    ],
    options: [
      { id: 'follow', textKey: 'sim.switch.option_follow', isSafe: false },
      { id: 'written', textKey: 'sim.switch.option_written', isSafe: true },
      { id: 'verbal', textKey: 'sim.switch.option_verbal', isSafe: false },
    ],
    safeTitleKey: 'sim.switch.safe_title',
    safeBodyKey: 'sim.switch.safe_body',
    unsafeTitleKey: 'sim.switch.unsafe_title',
    unsafeBodyKey: 'sim.switch.unsafe_body',
    sourceNoteKey: 'sim.switch.source_note',
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
