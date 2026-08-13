/**
 * Research telemetry is OFF for the MVP (SECURITY.md 8, PRD FR-16).
 *
 * No transport is implemented here on purpose. The allowlist exists so the boundary is
 * typed and testable before any collection is ever approved: `sanitizeEvent` drops every
 * property that is not on the list, and `isTelemetryEnabled` is a constant `false`.
 */

export const TELEMETRY_ENABLED = false as const;

export const ALLOWED_EVENT_NAMES = [
  'screen_view',
  'step_completed',
  'field_corrected',
  'evidence_opened',
  'action_selected',
] as const;

export type TelemetryEventName = (typeof ALLOWED_EVENT_NAMES)[number];

/** PRD FR-16 allowlist. Anything not named here can never be transmitted. */
export const ALLOWED_EVENT_PROPERTIES = [
  'studySessionId',
  'screenName',
  'outcome',
  'durationBucket',
  'correctedFieldCount',
  'evidenceCategory',
  'actionId',
  'viewportCategory',
  'appVersion',
  'ruleVersion',
  'sourceDataVersion',
] as const;

export type TelemetryProperty = (typeof ALLOWED_EVENT_PROPERTIES)[number];

export type TelemetryPayload = Partial<Record<TelemetryProperty, string | number>>;

export function sanitizeEvent(input: Record<string, unknown>): TelemetryPayload {
  const output: Record<string, string | number> = {};
  for (const key of ALLOWED_EVENT_PROPERTIES) {
    const value = input[key];
    if (typeof value === 'string' || typeof value === 'number') {
      output[key] = value;
    }
  }
  return output as TelemetryPayload;
}

export function isAllowedEventName(name: string): name is TelemetryEventName {
  return (ALLOWED_EVENT_NAMES as readonly string[]).includes(name);
}
