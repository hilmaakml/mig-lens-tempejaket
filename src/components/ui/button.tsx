import type { ButtonHTMLAttributes, ReactNode } from 'react';
import Link from 'next/link';

type Variant = 'primary' | 'secondary' | 'dark' | 'ghost';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-brand-primary text-white border-transparent',
  secondary: 'bg-transparent text-brand-dark border-border-strong border-[1.5px]',
  dark: 'bg-brand-dark text-white border-transparent',
  ghost: 'bg-surface-card text-brand-dark border-border-strong border-[1.4px]',
};

const BASE =
  'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-button border px-4 py-3.5 text-[15px] font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: Variant;
  readonly children: ReactNode;
}

/** Buttons perform actions. Anything that navigates uses `LinkButton` (CONVENTIONS.md 13.2). */
export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  return <button {...props} className={`${BASE} ${VARIANTS[variant]} ${className}`} />;
}

interface LinkButtonProps {
  readonly href: string;
  readonly variant?: Variant;
  readonly children: ReactNode;
  readonly className?: string;
}

export function LinkButton({
  href,
  variant = 'primary',
  children,
  className = '',
}: LinkButtonProps) {
  return (
    <Link href={href} className={`${BASE} ${VARIANTS[variant]} ${className}`}>
      {children}
    </Link>
  );
}
