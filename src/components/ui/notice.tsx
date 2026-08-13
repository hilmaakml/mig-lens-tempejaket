import type { ReactNode } from 'react';
import { Icon, type IconName } from '@/components/ui/icon';

export type NoticeTone = 'info' | 'warning' | 'match' | 'error';

const TONES: Record<NoticeTone, { className: string; icon: IconName }> = {
  info: {
    className: 'bg-unknown-bg text-text-secondary border-transparent',
    icon: 'info',
  },
  warning: {
    className: 'bg-risk-bg text-risk-deep border-risk-border',
    icon: 'warning',
  },
  match: {
    className: 'bg-match-bg text-match-text border-match-border',
    icon: 'shield-check',
  },
  error: {
    className: 'bg-mismatch-bg text-mismatch-text border-mismatch-border',
    icon: 'warning',
  },
};

interface NoticeProps {
  readonly tone?: NoticeTone;
  readonly title?: string;
  readonly children: ReactNode;
  /** Set for validation/error notices so assistive technology announces them. */
  readonly role?: 'status' | 'alert';
}

/** Callout used for privacy warnings, limitations, and recoverable errors. */
export function Notice({ tone = 'info', title, children, role }: NoticeProps) {
  const style = TONES[tone];
  return (
    <div
      role={role}
      className={`flex items-start gap-2.5 rounded-xl border p-3 text-[12.5px] leading-relaxed ${style.className}`}
    >
      <Icon name={style.icon} size={18} className="mt-0.5 shrink-0" />
      <div className="min-w-0">
        {title ? <strong className="mr-1 font-bold">{title}</strong> : null}
        {children}
      </div>
    </div>
  );
}
