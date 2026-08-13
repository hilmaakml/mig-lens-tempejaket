import { useSyncExternalStore, type MouseEvent } from 'react';
import UploadPage from '@/app/periksa/page';
import ConfirmationPage from '@/app/konfirmasi/page';
import ResultPage from '@/app/hasil/page';
import SharePage from '@/app/bagikan/page';
import ChannelsPage from '@/app/kanal/page';
import MessagePage from '@/app/pesan/page';
import LearningPage from '@/app/latihan/page';
import HomePage from '@/app/page';
import ProgressPage from '@/app/riwayat/page';
import { getRoute, navigationState, subscribeToRoute } from './navigation-mock';

const SCREENS: Record<string, () => React.JSX.Element> = {
  '/': HomePage,
  '/periksa': UploadPage,
  '/konfirmasi': ConfirmationPage,
  '/hasil': ResultPage,
  '/bagikan': SharePage,
  '/kanal': ChannelsPage,
  '/pesan': MessagePage,
  '/latihan': LearningPage,
  '/riwayat': ProgressPage,
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
