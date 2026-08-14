import { useSyncExternalStore, type MouseEvent } from 'react';
import UploadPage from '@/app/app/periksa/page';
import ConfirmationPage from '@/app/app/konfirmasi/page';
import ResultPage from '@/app/app/hasil/page';
import SharePage from '@/app/app/bagikan/page';
import ChannelsPage from '@/app/app/kanal/page';
import MessagePage from '@/app/app/pesan/page';
import LearningPage from '@/app/app/latihan/page';
import LandingPage from '@/app/page';
import HomePage from '@/app/app/page';
import ProgressPage from '@/app/app/riwayat/page';
import GuidePage from '@/app/app/panduan/page';
import SimulationPage from '@/app/app/latihan/simulasi/page';
import { getRoute, navigationState, subscribeToRoute } from './navigation-mock';

const SCREENS: Record<string, () => React.JSX.Element> = {
  '/': LandingPage,
  '/app': HomePage,
  '/app/periksa': UploadPage,
  '/app/konfirmasi': ConfirmationPage,
  '/app/hasil': ResultPage,
  '/app/bagikan': SharePage,
  '/app/kanal': ChannelsPage,
  '/app/pesan': MessagePage,
  '/app/latihan': LearningPage,
  '/app/riwayat': ProgressPage,
  '/app/latihan/simulasi': SimulationPage,
  '/app/panduan': GuidePage,
};

/**
 * Renders whichever screen the mocked router points at. jsdom does not navigate, so
 * in-app `<Link>` clicks are intercepted and routed through the same store the mocked
 * `useRouter().push` writes to. External links (http/https) are left alone so tests can
 * assert their href and rel attributes.
 */
export function FlowHarness() {
  const route = useSyncExternalStore(subscribeToRoute, getRoute, getRoute);
  const base = route.split('#')[0] ?? '/';
  const Screen = SCREENS[base] ?? UploadPage;

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    const anchor = (event.target as HTMLElement).closest('a');
    const href = anchor?.getAttribute('href');
    if (!href || !href.startsWith('/')) return;
    event.preventDefault();
    navigationState.pathname = href;
  };

  // The wrapper only captures bubbled anchor clicks for routing; it is a test shim, not UI.
  return (
    <div onClick={handleClick}>
      <Screen />
    </div>
  );
}
