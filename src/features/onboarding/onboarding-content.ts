import type { MessageKey } from '@/content/locales/message-key';
import {
  CATEGORY_LABEL_KEY,
  type EvidenceCategory,
} from '@/domain/evidence/evidence-item';
import type { IconName } from '@/components/ui/icon';

/**
 * The single content model behind both the first-run onboarding and the reusable Guide
 * (LANDING_PAGE.md section 8). Neither mode owns its own copy, so the two can never drift
 * apart.
 */

export interface HowStep {
  readonly titleKey: MessageKey;
  readonly bodyKey: MessageKey;
  readonly icon: IconName;
}

export const HOW_STEPS: readonly HowStep[] = [
  {
    titleKey: 'onboarding.how.step1.title',
    bodyKey: 'onboarding.how.step1.body',
    icon: 'upload',
  },
  {
    titleKey: 'onboarding.how.step2.title',
    bodyKey: 'onboarding.how.step2.body',
    icon: 'pencil',
  },
  {
    titleKey: 'onboarding.how.step3.title',
    bodyKey: 'onboarding.how.step3.body',
    icon: 'search',
  },
];

/**
 * The evidence categories listed in section 9.3. They reuse the same label keys the
 * Evidence Map renders, so the onboarding can never promise a category the checker does
 * not actually produce.
 */
export const CHECKED_CATEGORIES: readonly {
  readonly category: EvidenceCategory;
  readonly labelKey: MessageKey;
  readonly icon: IconName;
}[] = [
  { category: 'company', labelKey: CATEGORY_LABEL_KEY.company, icon: 'building' },
  { category: 'contact', labelKey: CATEGORY_LABEL_KEY.contact, icon: 'user' },
  { category: 'vacancy', labelKey: CATEGORY_LABEL_KEY.vacancy, icon: 'file' },
  { category: 'payment', labelKey: CATEGORY_LABEL_KEY.payment, icon: 'card' },
  { category: 'contract', labelKey: CATEGORY_LABEL_KEY.contract, icon: 'copy' },
  { category: 'visa', labelKey: CATEGORY_LABEL_KEY.visa, icon: 'shield' },
  {
    category: 'time_pressure',
    labelKey: CATEGORY_LABEL_KEY.time_pressure,
    icon: 'clock',
  },
];

export const PRIVACY_POINT_KEYS: readonly MessageKey[] = [
  'onboarding.privacy.point1',
  'onboarding.privacy.point2',
  'onboarding.privacy.point3',
  'onboarding.privacy.point4',
  'onboarding.privacy.point5',
];

/**
 * A small, original preview of the Evidence Map assembled from the product's own status
 * vocabulary — not a screenshot, and not an asset taken from anywhere else.
 */
export const EVIDENCE_PREVIEW: readonly {
  readonly labelKey: MessageKey;
  readonly status: 'source_match' | 'unverified' | 'risk_indicator';
}[] = [
  { labelKey: CATEGORY_LABEL_KEY.company, status: 'source_match' },
  { labelKey: CATEGORY_LABEL_KEY.contact, status: 'unverified' },
  { labelKey: CATEGORY_LABEL_KEY.payment, status: 'risk_indicator' },
];
