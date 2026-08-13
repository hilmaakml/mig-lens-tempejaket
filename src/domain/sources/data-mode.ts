/**
 * Runtime separation between demo fixtures, approved snapshots, and live sources
 * (DATA_SOURCES.md 7). A source failure can never become a demo success: the union has
 * no transition from `source_unavailable` to `demo`, and only the user's explicit
 * "use the demo offer" action can create the `demo` mode.
 */
export type EvidenceDataMode =
  | { readonly kind: 'demo'; readonly fixtureId: string }
  | { readonly kind: 'snapshot'; readonly snapshotId: string }
  | { readonly kind: 'live'; readonly sourceId: string }
  | { readonly kind: 'source_unavailable'; readonly sourceId: string };

export const isDemoMode = (mode: EvidenceDataMode): boolean => mode.kind === 'demo';

export const describeDataMode = (mode: EvidenceDataMode): string => {
  switch (mode.kind) {
    case 'demo':
      return `demo:${mode.fixtureId}`;
    case 'snapshot':
      return `snapshot:${mode.snapshotId}`;
    case 'live':
      return `live:${mode.sourceId}`;
    case 'source_unavailable':
      return `unavailable:${mode.sourceId}`;
  }
};
