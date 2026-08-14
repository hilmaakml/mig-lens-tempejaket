import type { MessageKey } from '@/content/locales/message-key';

/**
 * The reported case shown on `/app/skenario`.
 *
 * Unlike the demo fixture, this is a real, named case taken from published reporting, so it
 * is governed by PRD 11.3: it must carry documented provenance and must not be presented as
 * anything MigLens itself verified.
 *
 * Every factual statement in the linked copy comes from the detikJogja article below and
 * was checked against it. The accompanying photograph is an illustration, not a picture of
 * the person interviewed, and the caption says so.
 */

/** detikJogja, published article. Opened as a normal external link, never rewritten. */
export const CASE_SOURCE_URL =
  'https://www.detik.com/jogja/berita/d-8215612/kisah-pilu-pemuda-kulon-progo-disekap-dipukuli-sindikat-scammer-kamboja';

export const CASE_SOURCE_DOMAIN = 'detik.com';

/**
 * The practice scenario built from this case, in `domain/learning/scenarios`. The screen's
 * closing call to action opens that scenario rather than the composite one.
 */
export const CASE_SCENARIO_ID = 'offer-switched-country';

export interface CaseTimelineStep {
  readonly dateKey: MessageKey;
  readonly bodyKey: MessageKey;
}

export const CASE_TIMELINE: readonly CaseTimelineStep[] = [
  { dateKey: 'scenario.step1.date', bodyKey: 'scenario.step1.body' },
  { dateKey: 'scenario.step2.date', bodyKey: 'scenario.step2.body' },
  { dateKey: 'scenario.step3.date', bodyKey: 'scenario.step3.body' },
  { dateKey: 'scenario.step4.date', bodyKey: 'scenario.step4.body' },
];

/**
 * Each lesson maps to something the checker actually examines — a changed offer, a visa
 * type that does not match the work, and a large fee paid under time pressure.
 */
export const CASE_LESSON_KEYS: readonly MessageKey[] = [
  'scenario.lesson_1',
  'scenario.lesson_2',
  'scenario.lesson_3',
];
