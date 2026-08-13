'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { emptyOfferClaim, type OfferClaim } from '@/domain/claims/offer-claim';
import type { EvidenceDataMode } from '@/domain/sources/data-mode';
import type { SourceSnapshot } from '@/domain/sources/snapshot';
import {
  runVerification,
  type VerificationResult,
} from '@/domain/verification/run-verification';
import {
  demoFieldsNeedingReview,
  demoOfferClaim,
  DEMO_FIXTURE_ID,
} from '@data/fixtures/demo-offer';
import { demoP3miSnapshot } from '@data/fixtures/demo-p3mi-snapshot';

export type ClaimOrigin = 'manual' | 'ocr' | 'demo';

interface OfferState {
  readonly claim: OfferClaim;
  readonly origin: ClaimOrigin;
  readonly fieldsNeedingReview: readonly (keyof OfferClaim)[];
  readonly hasClaim: boolean;
  readonly result: VerificationResult | null;
}

interface OfferContextValue extends OfferState {
  readonly startDemo: () => void;
  readonly startManual: () => void;
  readonly applyExtraction: (
    claim: OfferClaim,
    fieldsNeedingReview: readonly (keyof OfferClaim)[],
  ) => void;
  readonly updateClaim: (patch: Partial<OfferClaim>) => void;
  readonly runChecks: (now?: Date) => VerificationResult;
  readonly reset: () => void;
}

const initialState: OfferState = {
  claim: emptyOfferClaim,
  origin: 'manual',
  fieldsNeedingReview: demoFieldsNeedingReview,
  hasClaim: false,
  result: null,
};

const OfferContext = createContext<OfferContextValue | null>(null);

/**
 * Offer state lives in React memory for the active flow only: no localStorage, no
 * sessionStorage, no cookie, no server call (SECURITY.md 2). A page reload therefore
 * clears it, and the result screen explains that instead of silently restoring anything.
 */
export function OfferProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OfferState>(initialState);

  const startDemo = useCallback(() => {
    setState({
      claim: demoOfferClaim,
      origin: 'demo',
      fieldsNeedingReview: [
        'contactHandle',
        'accountType',
        'contractStatus',
        'timePressure',
      ],
      hasClaim: true,
      result: null,
    });
  }, []);

  const startManual = useCallback(() => {
    setState({ ...initialState, hasClaim: true, origin: 'manual' });
  }, []);

  const applyExtraction = useCallback(
    (claim: OfferClaim, fieldsNeedingReview: readonly (keyof OfferClaim)[]) => {
      setState({
        claim,
        origin: 'ocr',
        fieldsNeedingReview,
        hasClaim: true,
        result: null,
      });
    },
    [],
  );

  const updateClaim = useCallback((patch: Partial<OfferClaim>) => {
    // A corrected value invalidates any previous result: rules must never run on a mix of
    // old and new claims (PRD FR-04).
    setState((current) => ({
      ...current,
      claim: { ...current.claim, ...patch },
      hasClaim: true,
      result: null,
    }));
  }, []);

  const runChecks = useCallback(
    (now: Date = new Date()) => {
      const isDemo = state.origin === 'demo';
      const dataMode: EvidenceDataMode = isDemo
        ? { kind: 'demo', fixtureId: DEMO_FIXTURE_ID }
        : // No approved production snapshot ships with this build, so a real offer is
          // checked against rules only and the company/vacancy sources report as
          // unavailable rather than falling back to the demo dataset.
          { kind: 'source_unavailable', sourceId: 'siskop2mi-p3mi' };
      const snapshot: SourceSnapshot | null = isDemo ? demoP3miSnapshot : null;
      const result = runVerification({ claim: state.claim, dataMode, snapshot, now });
      setState((current) => ({ ...current, result }));
      return result;
    },
    [state.claim, state.origin],
  );

  const reset = useCallback(() => setState(initialState), []);

  const value = useMemo<OfferContextValue>(
    () => ({
      ...state,
      startDemo,
      startManual,
      applyExtraction,
      updateClaim,
      runChecks,
      reset,
    }),
    [state, startDemo, startManual, applyExtraction, updateClaim, runChecks, reset],
  );

  return <OfferContext.Provider value={value}>{children}</OfferContext.Provider>;
}

export function useOffer(): OfferContextValue {
  const context = useContext(OfferContext);
  if (!context) throw new Error('useOffer must be used inside OfferProvider');
  return context;
}
