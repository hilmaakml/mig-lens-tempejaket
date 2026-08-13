'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Icon } from '@/components/ui/icon';

interface ToastContextValue {
  readonly showToast: (text: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * Copy/share feedback is announced through a polite live region as well as shown visually
 * (DESIGN.md 6, TESTING.md 6).
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [text, setText] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((next: string) => {
    setText(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setText(''), 4000);
  }, []);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div aria-live="polite" role="status" className="sr-only">
        {text}
      </div>
      {text ? (
        <div
          className="animate-toast-in fixed bottom-24 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-text-primary px-4 py-2.5 text-[13.5px] font-semibold text-white shadow-lg"
          data-testid="toast"
        >
          <Icon name="check" size={17} strokeWidth={2.2} className="text-brand-accent" />
          {text}
        </div>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside ToastProvider');
  return context;
}
