import Image from 'next/image';
import logo from '@/assets/logo.jpg';
import { BRAND } from '@/content/brand';

/**
 * Launch splash: the MigLens mark, centred, shown once per full page load.
 *
 * Deliberately a server component with no state and no client JavaScript. It is part of
 * the first HTML the browser receives, so it covers the screen from the first paint
 * instead of appearing after hydration, and it retires itself on a CSS animation
 * (`animate-splash`) rather than a timer. That matters more than it looks: an overlay
 * dismissed by JavaScript would stay forever if a script were blocked or a chunk failed,
 * which is exactly the dead end the entry route's escape hatch exists to avoid.
 *
 * Because the root layout is never remounted, client-side navigation does not replay it.
 * It appears when the application is opened or reloaded — including a PWA launch from the
 * home screen — and not between screens.
 *
 * The overlay is `aria-hidden`: it carries no information a screen reader needs, and the
 * page behind it is already announced normally. The wordmark is the product name, which
 * is identical in both locales, so nothing here needs the locale that only the client
 * knows.
 */
export function SplashScreen() {
  return (
    // z-[100] clears the skip link, the sticky headers, and the toast layer, which all
    // sit at z-50 or below; the splash must cover every one of them while it is up.
    <div
      aria-hidden="true"
      className="animate-splash fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-brand-dark"
    >
      {/* The mark sits on a light card: the logo artwork has a white ground of its own,
          which would otherwise read as a pale rectangle against the brand colour. */}
      <span className="animate-fade-up flex size-28 items-center justify-center rounded-3xl bg-white shadow-[0_10px_30px_rgba(0,0,0,.18)]">
        <Image
          src={logo}
          alt=""
          width={112}
          height={112}
          priority
          className="size-24 rounded-2xl object-contain"
        />
      </span>

      <span className="animate-fade-up text-xl font-extrabold tracking-tight text-white">
        {BRAND.name}
      </span>
    </div>
  );
}
