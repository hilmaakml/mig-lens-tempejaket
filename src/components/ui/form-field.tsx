'use client';

import { useId } from 'react';
import { Icon } from '@/components/ui/icon';
import { useLocale } from '@/app/providers/locale-provider';
import type { MessageKey } from '@/content/locales/message-key';

interface BaseProps {
  readonly labelKey: MessageKey;
  /** Marks a field the user should look at first; it is never a risk status. */
  readonly needsReview?: boolean;
  readonly errorKey?: MessageKey | null;
}

interface TextFieldProps extends BaseProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly maxLength?: number;
  readonly inputMode?: 'text' | 'tel' | 'numeric' | 'email';
  readonly name: string;
}

/** Labels are always visible and persistent (DESIGN.md 8, CONVENTIONS.md 13.2). */
export function TextField({
  labelKey,
  value,
  onChange,
  needsReview,
  errorKey,
  maxLength = 160,
  inputMode = 'text',
  name,
}: TextFieldProps) {
  const { t } = useLocale();
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className="border-b border-border-default px-4 py-3 last:border-b-0">
      <div className="flex items-start justify-between gap-2">
        <label
          htmlFor={id}
          className="text-[11.5px] font-bold tracking-wide text-text-faint uppercase"
        >
          {t(labelKey)}
        </label>
        {needsReview ? <NeedsReviewBadge /> : null}
      </div>
      <input
        id={id}
        name={name}
        type="text"
        inputMode={inputMode}
        value={value}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={errorKey ? true : undefined}
        aria-describedby={errorKey ? errorId : undefined}
        placeholder={t('confirm.empty')}
        className="mt-1.5 min-h-11 w-full rounded-lg border border-border-strong bg-surface-app px-3 py-2 text-text-primary"
      />
      {errorKey ? (
        <p id={errorId} className="mt-1 text-[12px] font-semibold text-mismatch-text">
          {t(errorKey)}
        </p>
      ) : null}
    </div>
  );
}

interface SelectFieldProps<T extends string> extends BaseProps {
  readonly value: T;
  readonly onChange: (value: T) => void;
  readonly options: readonly { readonly value: T; readonly labelKey: MessageKey }[];
  readonly name: string;
}

export function SelectField<T extends string>({
  labelKey,
  value,
  onChange,
  options,
  needsReview,
  name,
}: SelectFieldProps<T>) {
  const { t } = useLocale();
  const id = useId();

  return (
    <div className="border-b border-border-default px-4 py-3 last:border-b-0">
      <div className="flex items-start justify-between gap-2">
        <label
          htmlFor={id}
          className="text-[11.5px] font-bold tracking-wide text-text-faint uppercase"
        >
          {t(labelKey)}
        </label>
        {needsReview ? <NeedsReviewBadge /> : null}
      </div>
      <select
        id={id}
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="mt-1.5 min-h-11 w-full rounded-lg border border-border-strong bg-surface-app px-3 py-2 text-text-primary"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {t(option.labelKey)}
          </option>
        ))}
      </select>
    </div>
  );
}

function NeedsReviewBadge() {
  const { t } = useLocale();
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-risk-border bg-risk-bg px-2 py-1 text-[10.5px] font-bold text-risk-text">
      <Icon name="warning" size={12} strokeWidth={2.2} />
      {t('confirm.needs_check')}
    </span>
  );
}
