import type { SVGProps } from 'react';

/**
 * Internal icon set copied from the reference prototype (DESIGN.md 7). Icons are
 * decorative by default (`aria-hidden`); status meaning is always carried by adjacent text.
 */
export type IconName =
  | 'shield-check'
  | 'shield'
  | 'bell'
  | 'search'
  | 'graduation'
  | 'chevron-right'
  | 'chevron-down'
  | 'chevron-left'
  | 'upload'
  | 'camera'
  | 'file'
  | 'pencil'
  | 'info'
  | 'warning'
  | 'check'
  | 'question'
  | 'building'
  | 'user'
  | 'card'
  | 'external'
  | 'phone'
  | 'share'
  | 'message'
  | 'copy'
  | 'clock'
  | 'home'
  | 'arrow-right'
  | 'bolt'
  | 'book'
  | 'cross';

const PATHS: Record<IconName, React.ReactNode> = {
  'shield-check': (
    <>
      <path d="M12 3l7 3v5c0 4.6-3 7.7-7 9-4-1.3-7-4.4-7-9V6z" />
      <path d="M9 12l2 2 4-4" strokeLinecap="round" />
    </>
  ),
  shield: <path d="M12 3l7 3v5c0 4.6-3 7.7-7 9-4-1.3-7-4.4-7-9V6z" />,
  bell: (
    <>
      <path d="M6 9a6 6 0 0 1 12 0c0 4.5 1.5 5.5 2 6H4c.5-.5 2-1.5 2-6" />
      <path d="M10.5 20a1.7 1.7 0 0 0 3 0" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M20 20l-4-4" />
    </>
  ),
  graduation: (
    <>
      <path d="M12 5l9 4-9 4-9-4 9-4z" />
      <path d="M6 11v4c0 1.1 2.7 2.6 6 2.6s6-1.5 6-2.6v-4" />
    </>
  ),
  'chevron-right': <path d="M9 6l6 6-6 6" />,
  'chevron-down': <path d="M6 9l6 6 6-6" />,
  'chevron-left': <path d="M15 5l-7 7 7 7" />,
  upload: (
    <>
      <path d="M12 16V6" />
      <path d="M8 10l4-4 4 4" />
      <path d="M5 18h14" />
    </>
  ),
  camera: (
    <>
      <path d="M4 8h3l1.5-2h7L17 8h3v11H4z" />
      <circle cx="12" cy="13" r="3.2" />
    </>
  ),
  file: (
    <>
      <path d="M7 3h7l4 4v14H7z" />
      <path d="M14 3v4h4" />
    </>
  ),
  pencil: <path d="M4 20h4L19 9l-4-4L4 16z" />,
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <path d="M12 8h.01" />
    </>
  ),
  warning: (
    <>
      <path d="M12 4l9 16H3z" />
      <path d="M12 10v4" />
      <path d="M12 17h.01" />
    </>
  ),
  check: <path d="M4 12l5 5L20 6" />,
  question: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.6 2.6 0 0 1 5 .8c0 1.8-2.5 2-2.5 3.7" />
      <path d="M12 17h.01" />
    </>
  ),
  building: (
    <>
      <path d="M4 20V7l8-4 8 4v13" />
      <path d="M4 20h16" />
      <path d="M9 20v-5h6v5" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5 20c1-4 4.5-5 7-5s6 1 7 5" />
    </>
  ),
  card: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M3 10h18" />
    </>
  ),
  external: (
    <>
      <path d="M14 4h6v6" />
      <path d="M20 4l-9 9" />
      <path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </>
  ),
  phone: (
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.5 2.5a2 2 0 0 1-.6 1.9L7.6 9.8a16 16 0 0 0 6 6l1.7-1.4a2 2 0 0 1 1.9-.6l2.5.5a2 2 0 0 1 1.8 2z" />
  ),
  share: (
    <>
      <circle cx="18" cy="6" r="2.4" />
      <circle cx="6" cy="12" r="2.4" />
      <circle cx="18" cy="18" r="2.4" />
      <path d="M8 11l8-4M8 13l8 4" />
    </>
  ),
  message: <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H9l-5 4z" />,
  copy: (
    <>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h8" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5v5l3.2 2" />
    </>
  ),
  home: (
    <>
      <path d="M4 11l8-6 8 6" />
      <path d="M6 10v9h12v-9" />
    </>
  ),
  'arrow-right': (
    <>
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </>
  ),
  bolt: <path d="M13 3L5 14h6l-1 7 8-11h-6z" />,
  book: (
    <>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19v15H6.5A2.5 2.5 0 0 0 4 20.5z" />
      <path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H19v3H6.5A2.5 2.5 0 0 1 4 20.5z" />
    </>
  ),
  cross: (
    <>
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </>
  ),
};

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  readonly name: IconName;
  readonly size?: number;
  /** Provide when the icon is the only carrier of meaning; otherwise keep it decorative. */
  readonly title?: string;
}

export function Icon({ name, size = 20, title, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {PATHS[name]}
    </svg>
  );
}
