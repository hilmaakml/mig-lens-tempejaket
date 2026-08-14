import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderApp } from '../helpers/render-app';
import { FlowHarness } from '../helpers/flow-harness';
import { navigationState, resetNavigation, routerMock } from '../helpers/navigation-mock';
import { ONBOARDING_STORAGE_KEY } from '@/domain/onboarding/onboarding-state';
import { resetOnboardingCache } from '@/domain/onboarding/onboarding-store';
import { PROGRESS_STORAGE_KEY } from '@/domain/progress/progress-storage';

beforeEach(() => {
  window.localStorage.clear();
  resetOnboardingCache();
  resetNavigation('/');
});

const markCompleted = () => {
  window.localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
  resetOnboardingCache();
};

describe('first visit', () => {
  it('shows the onboarding page at the entry route', async () => {
    renderApp(<FlowHarness />);
    expect(
      await screen.findByRole('heading', {
        name: 'Lihat bukti di balik setiap tawaran.',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Pemeriksaan tawaran kerja berbasis bukti'),
    ).toBeInTheDocument();
  });

  it('shows all four sections and the closing call to action', async () => {
    renderApp(<FlowHarness />);
    await screen.findByRole('heading', { name: 'Lihat bukti di balik setiap tawaran.' });
    expect(
      screen.getByText('Satu tawaran terdiri dari banyak hal yang perlu dibuktikan.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Cara kerjanya')).toBeInTheDocument();
    expect(screen.getByText('Privasi sejak awal.')).toBeInTheDocument();
    expect(
      screen.getByText('Punya tawaran kerja? Periksa buktinya terlebih dahulu.'),
    ).toBeInTheDocument();
  });

  it('shows no bottom navigation', async () => {
    renderApp(<FlowHarness />);
    await screen.findByRole('heading', { name: 'Lihat bukti di balik setiap tawaran.' });
    expect(screen.queryByRole('navigation', { name: /Navigasi utama/ })).toBeNull();
  });

  it('writes nothing to storage merely by rendering', async () => {
    renderApp(<FlowHarness />);
    await screen.findByRole('heading', { name: 'Lihat bukti di balik setiap tawaran.' });
    expect(window.localStorage.getItem(ONBOARDING_STORAGE_KEY)).toBeNull();
  });

  it('lists the evidence categories it actually checks', async () => {
    renderApp(<FlowHarness />);
    await screen.findByRole('heading', { name: 'Lihat bukti di balik setiap tawaran.' });
    for (const label of ['Perusahaan / P3MI', 'Lowongan', 'Kontrak', 'Visa']) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    }
  });
});

describe('completing onboarding', () => {
  it('marks it complete and opens the checker from the primary action', async () => {
    const { user } = renderApp(<FlowHarness />);
    await screen.findByRole('heading', { name: 'Lihat bukti di balik setiap tawaran.' });

    await user.click(screen.getAllByRole('button', { name: 'Mulai Periksa' })[0]!);

    expect(window.localStorage.getItem(ONBOARDING_STORAGE_KEY)).toBe('true');
    // History replacement, so Back does not reopen first run.
    expect(routerMock.replace).toHaveBeenCalledWith('/app/periksa');
  });

  it('marks it complete and opens the app home from Skip', async () => {
    const { user } = renderApp(<FlowHarness />);
    await screen.findByRole('heading', { name: 'Lihat bukti di balik setiap tawaran.' });

    await user.click(screen.getByRole('button', { name: 'Lewati' }));

    expect(window.localStorage.getItem(ONBOARDING_STORAGE_KEY)).toBe('true');
    expect(routerMock.replace).toHaveBeenCalledWith('/app');
  });

  it('does not block entry when storage cannot be written', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    const { user } = renderApp(<FlowHarness />);
    await screen.findByRole('heading', { name: 'Lihat bukti di balik setiap tawaran.' });

    await user.click(screen.getByRole('button', { name: 'Lewati' }));
    expect(routerMock.replace).toHaveBeenCalledWith('/app');
    vi.restoreAllMocks();
  });
});

describe('returning visitor', () => {
  it('goes straight to the app home without rendering onboarding', async () => {
    markCompleted();
    renderApp(<FlowHarness />);

    await waitFor(() => expect(routerMock.replace).toHaveBeenCalledWith('/app'));
    expect(
      screen.queryByRole('heading', { name: 'Lihat bukti di balik setiap tawaran.' }),
    ).toBeNull();
  });

  it('never flashes onboarding before entering the application', async () => {
    markCompleted();
    renderApp(<FlowHarness />);
    // No onboarding content is rendered at any point, only the holding state.
    expect(
      screen.queryByRole('heading', { name: 'Lihat bukti di balik setiap tawaran.' }),
    ).toBeNull();
    expect(screen.queryByRole('button', { name: 'Lewati' })).toBeNull();
    await waitFor(() => expect(routerMock.replace).toHaveBeenCalledWith('/app'));
  });
});

describe('the reusable Guide', () => {
  it('is reachable from an application header', async () => {
    markCompleted();
    resetNavigation('/app/periksa');
    renderApp(<FlowHarness />);

    const guide = await screen.findByRole('link', { name: 'Panduan' });
    expect(guide).toHaveAttribute('href', '/app/panduan');
  });

  it('renders the same content as onboarding', async () => {
    markCompleted();
    resetNavigation('/app/panduan');
    renderApp(<FlowHarness />);

    expect(
      await screen.findByRole('heading', {
        name: 'Lihat bukti di balik setiap tawaran.',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Privasi sejak awal.')).toBeInTheDocument();
    expect(
      screen.getByText('Satu tawaran terdiri dari banyak hal yang perlu dibuktikan.'),
    ).toBeInTheDocument();
  });

  it('offers a return action instead of Skip', async () => {
    markCompleted();
    resetNavigation('/app/panduan');
    renderApp(<FlowHarness />);

    expect(
      await screen.findByRole('button', { name: 'Kembali ke Aplikasi' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Lewati' })).toBeNull();
  });

  it('never clears or rewrites the onboarding flag', async () => {
    markCompleted();
    resetNavigation('/app/panduan');
    const { user } = renderApp(<FlowHarness />);

    await user.click(await screen.findByRole('button', { name: 'Kembali ke Aplikasi' }));
    expect(window.localStorage.getItem(ONBOARDING_STORAGE_KEY)).toBe('true');
  });

  it('preserves the in-memory check result when opened mid-flow', async () => {
    markCompleted();
    resetNavigation('/app/periksa');
    const { user } = renderApp(<FlowHarness />);

    await user.click(
      await screen.findByRole('button', { name: /Gunakan contoh tawaran/i }),
    );
    await user.click(
      await screen.findByRole('button', { name: 'Lanjutkan pemeriksaan' }),
    );
    await screen.findByText('Tunda pembayaran dulu');

    navigationState.pathname = '/app/panduan';
    await screen.findByText('Privasi sejak awal.');

    // Back to the result: the evidence is still there, nothing was rerun.
    navigationState.pathname = '/app/hasil';
    expect(await screen.findByText('Tunda pembayaran dulu')).toBeInTheDocument();
    expect(screen.getByText('4 indikator risiko ditemukan')).toBeInTheDocument();
  });
});

describe('language switching during onboarding', () => {
  it('switches copy without marking onboarding complete', async () => {
    const { user } = renderApp(<FlowHarness />);
    await screen.findByRole('heading', { name: 'Lihat bukti di balik setiap tawaran.' });

    await user.click(screen.getByRole('radio', { name: 'Bahasa Inggris' }));

    expect(
      await screen.findByRole('heading', {
        name: 'See the evidence behind every offer.',
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Skip' })).toBeInTheDocument();
    expect(window.localStorage.getItem(ONBOARDING_STORAGE_KEY)).toBeNull();
  });

  it('keeps English through completion', async () => {
    const { user } = renderApp(<FlowHarness />);
    await screen.findByRole('heading', { name: 'Lihat bukti di balik setiap tawaran.' });
    await user.click(screen.getByRole('radio', { name: 'Bahasa Inggris' }));

    await user.click(
      (await screen.findAllByRole('button', { name: 'Start Checking' }))[0]!,
    );
    expect(window.localStorage.getItem(ONBOARDING_STORAGE_KEY)).toBe('true');
    expect(routerMock.replace).toHaveBeenCalledWith('/app/periksa');
  });
});

describe('storage stays within the approved keys', () => {
  it('adds no key beyond locale, progress, and onboarding', async () => {
    const { user } = renderApp(<FlowHarness />);
    await screen.findByRole('heading', { name: 'Lihat bukti di balik setiap tawaran.' });
    await user.click(screen.getByRole('radio', { name: 'Bahasa Inggris' }));
    await user.click(screen.getByRole('button', { name: 'Skip' }));

    for (const key of Object.keys({ ...window.localStorage })) {
      expect([
        'miglens.uiLocale',
        PROGRESS_STORAGE_KEY,
        ONBOARDING_STORAGE_KEY,
      ]).toContain(key);
    }
  });
});
