'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ScreenHeader } from '@/components/layout/screen-header';
import { Button, LinkButton } from '@/components/ui/button';
import { Notice } from '@/components/ui/notice';
import { SelectField, TextField } from '@/components/ui/form-field';
import { useLocale } from '@/app/providers/locale-provider';
import { useOffer } from '@/app/providers/offer-provider';
import type { MessageKey } from '@/content/locales/message-key';
import type {
  AccountType,
  AgreementComparison,
  ConfirmationStatus,
  ContactChannel,
  DocumentStatus,
  OfferClaim,
  TimePressure,
} from '@/domain/claims/offer-claim';

const ACCOUNT_OPTIONS: readonly { value: AccountType; labelKey: MessageKey }[] = [
  { value: 'unknown', labelKey: 'option.account.unknown' },
  { value: 'personal', labelKey: 'option.account.personal' },
  { value: 'company', labelKey: 'option.account.company' },
];

const DOCUMENT_OPTIONS: readonly { value: DocumentStatus; labelKey: MessageKey }[] = [
  { value: 'unknown', labelKey: 'option.document.unknown' },
  { value: 'provided', labelKey: 'option.document.provided' },
  { value: 'not_provided', labelKey: 'option.document.not_provided' },
];

const AGREEMENT_OPTIONS: readonly { value: AgreementComparison; labelKey: MessageKey }[] =
  [
    { value: 'unknown', labelKey: 'option.agreement.unknown' },
    { value: 'same', labelKey: 'option.agreement.same' },
    { value: 'different', labelKey: 'option.agreement.different' },
  ];

const CONFIRMATION_OPTIONS: readonly {
  value: ConfirmationStatus;
  labelKey: MessageKey;
}[] = [
  { value: 'unknown', labelKey: 'option.confirmation.unknown' },
  { value: 'done', labelKey: 'option.confirmation.done' },
  { value: 'not_done', labelKey: 'option.confirmation.not_done' },
];

const TIME_OPTIONS: readonly { value: TimePressure; labelKey: MessageKey }[] = [
  { value: 'unknown', labelKey: 'option.time.unknown' },
  { value: 'same_day', labelKey: 'option.time.same_day' },
  { value: 'within_days', labelKey: 'option.time.within_days' },
  { value: 'no_deadline', labelKey: 'option.time.no_deadline' },
];

const CHANNEL_OPTIONS: readonly { value: ContactChannel; labelKey: MessageKey }[] = [
  { value: 'unknown', labelKey: 'option.channel.unknown' },
  { value: 'whatsapp', labelKey: 'option.channel.whatsapp' },
  { value: 'phone', labelKey: 'option.channel.phone' },
  { value: 'sms', labelKey: 'option.channel.sms' },
  { value: 'email', labelKey: 'option.channel.email' },
  { value: 'social', labelKey: 'option.channel.social' },
];

/** At least one identifying claim is needed before a check is meaningful. */
const IDENTIFYING_FIELDS: readonly (keyof OfferClaim)[] = [
  'companyName',
  'position',
  'contactHandle',
  'paymentAmount',
];

export default function ConfirmationPage() {
  const router = useRouter();
  const { t } = useLocale();
  const { claim, origin, fieldsNeedingReview, updateClaim, runChecks } = useOffer();
  const [showValidation, setShowValidation] = useState(false);

  const needsReview = useMemo(() => new Set(fieldsNeedingReview), [fieldsNeedingReview]);

  const emptyIdentifying = IDENTIFYING_FIELDS.filter(
    (field) => String(claim[field]).trim().length === 0,
  );
  const canContinue = emptyIdentifying.length < IDENTIFYING_FIELDS.length;

  const originKey: MessageKey =
    origin === 'demo'
      ? 'confirm.extraction_source_demo'
      : origin === 'ocr'
        ? 'confirm.extraction_source_ocr'
        : 'confirm.extraction_source_manual';

  const handleSubmit = () => {
    if (!canContinue) {
      setShowValidation(true);
      return;
    }
    runChecks();
    router.push('/hasil');
  };

  const text = (field: keyof OfferClaim, labelKey: MessageKey, inputMode?: 'tel') => (
    <TextField
      key={field}
      name={field}
      labelKey={labelKey}
      value={String(claim[field])}
      onChange={(value) => updateClaim({ [field]: value } as Partial<OfferClaim>)}
      needsReview={needsReview.has(field)}
      inputMode={inputMode}
    />
  );

  return (
    <div className="pb-8">
      <ScreenHeader
        titleKey="confirm.title"
        backHref="/periksa"
        showDemoBadge={origin === 'demo'}
      />

      <div className="flex flex-col gap-4 px-4 py-4">
        <Notice tone="info">{t('confirm.notice')}</Notice>

        {showValidation && !canContinue ? (
          <Notice tone="error" role="alert">
            {t('confirm.validation_summary', { count: IDENTIFYING_FIELDS.length })}
          </Notice>
        ) : null}

        <Section titleKey="confirm.section_offer">
          {text('companyName', 'field.companyName')}
          {text('recruiterName', 'field.recruiterName')}
          {text('position', 'field.position')}
          {text('destinationCountry', 'field.destinationCountry')}
          {text('offerOrigin', 'field.offerOrigin')}
        </Section>

        <Section titleKey="confirm.section_contact">
          <SelectField
            name="contactChannel"
            labelKey="field.contactChannel"
            value={claim.contactChannel}
            options={CHANNEL_OPTIONS}
            onChange={(value) => updateClaim({ contactChannel: value })}
          />
          {text('contactHandle', 'field.contactHandle', 'tel')}
        </Section>

        <Section titleKey="confirm.section_payment">
          {text('paymentAmount', 'field.paymentAmount')}
          {text('paymentPurpose', 'field.paymentPurpose')}
          {text('paymentRecipient', 'field.paymentRecipient')}
          <SelectField
            name="accountType"
            labelKey="field.accountType"
            value={claim.accountType}
            options={ACCOUNT_OPTIONS}
            needsReview={needsReview.has('accountType')}
            onChange={(value) => updateClaim({ accountType: value })}
          />
          <SelectField
            name="writtenFeeBreakdown"
            labelKey="field.writtenFeeBreakdown"
            value={claim.writtenFeeBreakdown}
            options={DOCUMENT_OPTIONS}
            onChange={(value) => updateClaim({ writtenFeeBreakdown: value })}
          />
          <SelectField
            name="receipt"
            labelKey="field.receipt"
            value={claim.receipt}
            options={DOCUMENT_OPTIONS}
            onChange={(value) => updateClaim({ receipt: value })}
          />
          <SelectField
            name="recipientVsAgreement"
            labelKey="field.recipientVsAgreement"
            value={claim.recipientVsAgreement}
            options={AGREEMENT_OPTIONS}
            onChange={(value) => updateClaim({ recipientVsAgreement: value })}
          />
          <SelectField
            name="purposeVsAgreement"
            labelKey="field.purposeVsAgreement"
            value={claim.purposeVsAgreement}
            options={AGREEMENT_OPTIONS}
            onChange={(value) => updateClaim({ purposeVsAgreement: value })}
          />
          <SelectField
            name="officialChannelConfirmation"
            labelKey="field.officialChannelConfirmation"
            value={claim.officialChannelConfirmation}
            options={CONFIRMATION_OPTIONS}
            onChange={(value) => updateClaim({ officialChannelConfirmation: value })}
          />
        </Section>

        <Section titleKey="confirm.section_documents">
          <SelectField
            name="contractStatus"
            labelKey="field.contractStatus"
            value={claim.contractStatus}
            options={DOCUMENT_OPTIONS}
            needsReview={needsReview.has('contractStatus')}
            onChange={(value) => updateClaim({ contractStatus: value })}
          />
          <SelectField
            name="visaStatus"
            labelKey="field.visaStatus"
            value={claim.visaStatus}
            options={DOCUMENT_OPTIONS}
            needsReview={needsReview.has('visaStatus')}
            onChange={(value) => updateClaim({ visaStatus: value })}
          />
          {text('visaType', 'field.visaType')}
          <SelectField
            name="timePressure"
            labelKey="field.timePressure"
            value={claim.timePressure}
            options={TIME_OPTIONS}
            needsReview={needsReview.has('timePressure')}
            onChange={(value) => updateClaim({ timePressure: value })}
          />
          {text('paymentDeadlineNote', 'field.paymentDeadlineNote')}
        </Section>

        <p className="text-[11.5px] leading-snug text-text-faint">
          {t('confirm.extraction_source', { source: t(originKey) })}
          {origin === 'demo' ? ` · ${t('app.demo_badge')}` : ''}
        </p>

        <div className="flex flex-col gap-2">
          <Button variant="primary" onClick={handleSubmit}>
            {t('confirm.submit')}
          </Button>
          <LinkButton href="/periksa" variant="secondary">
            {t('confirm.back_to_upload')}
          </LinkButton>
        </div>
      </div>
    </div>
  );
}

function Section({
  titleKey,
  children,
}: {
  readonly titleKey: MessageKey;
  readonly children: React.ReactNode;
}) {
  const { t } = useLocale();
  return (
    <section>
      <h2 className="mb-2 text-xs font-bold tracking-wide text-text-muted uppercase">
        {t(titleKey)}
      </h2>
      <div className="overflow-hidden rounded-card border border-border-default bg-surface-card">
        {children}
      </div>
    </section>
  );
}
