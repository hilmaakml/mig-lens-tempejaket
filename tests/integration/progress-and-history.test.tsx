import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import { renderApp } from '../helpers/render-app';
import { FlowHarness } from '../helpers/flow-harness';
import { resetNavigation, navigationState } from '../helpers/navigation-mock';
import { PROGRESS_STORAGE_KEY } from '@/domain/progress/progress-storage';
import { LOCALE_STORAGE_KEY } from '@/domain/privacy/locale-storage';
import { resetProgressCache } from '@/domain/progress/progress-store';
import { TOTAL_SCENARIO_COUNT } from '@/domain/learning/scenarios';

beforeEach(() => {
  window.localStorage.clear();
  resetProgressCache();
  resetNavigation('/');
});

/** Answers the practice scenario safely, which is what earns progress. */
async function answerScenarioSafely(user: ReturnType<typeof renderApp>['user']) {
  navigationState.pathname = '/latihan/simulasi';
  await user.click(
    await screen.findByRole('button', { name: /Saya perlu verifikasi dulu/ }),
  );
  await screen.findByText('Tepat. Anda menunda dan meminta bukti resmi.');
}

/** Runs a real (non-demo) check through to the result screen. */
async function runRealCheck(user: ReturnType<typeof renderApp>['user']) {
  navigationState.pathname = '/periksa';
  await user.click(await screen.findByRole('button', { name: 'Tulis Manual' }));
  const companyInput = await screen.findByLabelText('Perusahaan / P3MI');
  await user.type(companyInput, 'PT Contoh Manual');
  await user.selectOptions(screen.getByLabelText('Jenis rekening'), 'personal');
  await user.click(screen.getByRole('button', { name: 'Lanjutkan pemeriksaan' }));
  await screen.findByText('Tunda pembayaran dulu');
}

describe('first visit is empty (no hardcoded demo progress)', () => {
  it('shows 0 of 5 readiness on the home screen', async () => {
    renderApp(<FlowHarness />);
    expect(await screen.findByText('0/5')).toBeInTheDocument();
    expect(screen.getByText(/0 dari 5 langkah verifikasi inti/)).toBeInTheDocument();
  });

  it('shows 0 of N practice progress, with N from the scenario catalogue', async () => {
    resetNavigation('/latihan');
    renderApp(<FlowHarness />);
    expect(
      await screen.findByText(
        `Sudah dikenali dalam 0 dari ${TOTAL_SCENARIO_COUNT} latihan.`,
      ),
    ).toBeInTheDocument();
  });

  it('shows an empty history with no example entries', async () => {
    resetNavigation('/riwayat');
    renderApp(<FlowHarness />);

    expect(await screen.findByTestId('history-empty')).toBeInTheDocument();
    expect(screen.queryByTestId('history-list')).not.toBeInTheDocument();
    // The removed hardcoded rows must not come back.
    expect(screen.queryByText('Tawaran caregiver Taiwan')).not.toBeInTheDocument();
    expect(screen.queryByText('Lowongan pabrik Malaysia')).not.toBeInTheDocument();
    expect(screen.getByText('0/5')).toBeInTheDocument();
  });

  it('writes nothing to storage before the user does anything', () => {
    renderApp(<FlowHarness />);
    expect(window.localStorage.getItem(PROGRESS_STORAGE_KEY)).toBeNull();
  });
});

describe('practice updates progress', () => {
  it('credits the matching exercise after a correct answer', async () => {
    const { user } = renderApp(<FlowHarness />);
    await answerScenarioSafely(user);

    navigationState.pathname = '/riwayat';
    expect(await screen.findByText('1/5')).toBeInTheDocument();
    expect(
      screen.getByText(`Sudah dikenali dalam 1 dari ${TOTAL_SCENARIO_COUNT} latihan.`),
    ).toBeInTheDocument();
  });

  it('credits nothing for an unsafe answer', async () => {
    const { user } = renderApp(<FlowHarness />);
    navigationState.pathname = '/latihan/simulasi';
    await user.click(
      await screen.findByRole('button', { name: /Baik, saya transfer sekarang juga/ }),
    );
    await screen.findByText('Hati-hati — ini yang diincar pelaku penipuan.');

    navigationState.pathname = '/riwayat';
    expect(await screen.findByText('0/5')).toBeInTheDocument();
  });

  it('does not double count when the same scenario is repeated', async () => {
    const { user } = renderApp(<FlowHarness />);
    await answerScenarioSafely(user);

    // Retry the same scenario and answer safely again.
    await user.click(screen.getByRole('link', { name: 'Lihat pembongkaran pola' }));
    navigationState.pathname = '/latihan/simulasi';
    await user.click(
      await screen.findByRole('button', { name: /Saya perlu verifikasi dulu/ }),
    );

    navigationState.pathname = '/riwayat';
    expect(await screen.findByText('1/5')).toBeInTheDocument();
    expect(
      screen.getByText(`Sudah dikenali dalam 1 dari ${TOTAL_SCENARIO_COUNT} latihan.`),
    ).toBeInTheDocument();
  });

  it('keeps progress after a reload', async () => {
    const { user, unmount } = renderApp(<FlowHarness />);
    await answerScenarioSafely(user);

    // Simulate a fresh page load: unmount, drop the in-memory cache, render again.
    unmount();
    resetProgressCache();
    resetNavigation('/riwayat');
    renderApp(<FlowHarness />);

    expect(await screen.findByText('1/5')).toBeInTheDocument();
  });
});

describe('a completed check produces exactly one history entry', () => {
  it('records the check and shows it in the history', async () => {
    const { user } = renderApp(<FlowHarness />);
    await runRealCheck(user);

    navigationState.pathname = '/riwayat';
    const list = await screen.findByTestId('history-list');
    expect(within(list).getAllByRole('listitem')).toHaveLength(1);
    expect(within(list).getByText('Pemeriksaan tawaran')).toBeInTheDocument();
  });

  it('does not duplicate the entry when the result screen is revisited', async () => {
    const { user } = renderApp(<FlowHarness />);
    await runRealCheck(user);

    // Leave and return to the result screen several times.
    navigationState.pathname = '/riwayat';
    await screen.findByTestId('history-list');
    navigationState.pathname = '/hasil';
    await screen.findByText('Tunda pembayaran dulu');
    navigationState.pathname = '/riwayat';

    const list = await screen.findByTestId('history-list');
    expect(within(list).getAllByRole('listitem')).toHaveLength(1);
  });

  it('does not duplicate the entry after a reload of the result screen', async () => {
    const { user, unmount } = renderApp(<FlowHarness />);
    await runRealCheck(user);

    // A reload clears the in-memory offer state, so the result screen shows its
    // recovery notice and must not write a second entry.
    unmount();
    resetProgressCache();
    resetNavigation('/hasil');
    const second = renderApp(<FlowHarness />);
    expect(
      await screen.findByText('Data pemeriksaan tidak tersedia lagi'),
    ).toBeInTheDocument();

    second.unmount();
    resetNavigation('/riwayat');
    renderApp(<FlowHarness />);
    const list = await screen.findByTestId('history-list');
    expect(within(list).getAllByRole('listitem')).toHaveLength(1);
  });

  it('keeps the history after a reload', async () => {
    const { user, unmount } = renderApp(<FlowHarness />);
    await runRealCheck(user);

    unmount();
    resetProgressCache();
    resetNavigation('/riwayat');
    renderApp(<FlowHarness />);

    const list = await screen.findByTestId('history-list');
    expect(within(list).getAllByRole('listitem')).toHaveLength(1);
  });
});

describe('the demo never becomes real progress or history', () => {
  it('records no history for a demo check', async () => {
    const { user } = renderApp(<FlowHarness />);
    navigationState.pathname = '/periksa';
    await user.click(
      await screen.findByRole('button', { name: /Gunakan contoh tawaran/i }),
    );
    await user.click(
      await screen.findByRole('button', { name: 'Lanjutkan pemeriksaan' }),
    );
    await screen.findByText('Tunda pembayaran dulu');

    navigationState.pathname = '/riwayat';
    expect(await screen.findByTestId('history-empty')).toBeInTheDocument();
    expect(screen.getByText('0/5')).toBeInTheDocument();
    expect(window.localStorage.getItem(PROGRESS_STORAGE_KEY)).toBeNull();
  });
});

describe('stored data stays minimal', () => {
  it('contains no offer content after a real check', async () => {
    const { user } = renderApp(<FlowHarness />);
    await runRealCheck(user);

    const raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY) ?? '';
    expect(raw.length).toBeGreaterThan(0);
    for (const forbidden of ['PT Contoh Manual', 'Caregiver', 'Taiwan', '886', 'Rp']) {
      expect(raw).not.toContain(forbidden);
    }
  });
});

describe('resetting local data', () => {
  it('clears progress and history but keeps the language choice', async () => {
    const { user } = renderApp(<FlowHarness />);
    await answerScenarioSafely(user);
    await runRealCheck(user);

    navigationState.pathname = '/riwayat';
    await screen.findByTestId('history-list');

    // The locale is only persisted once the user actually picks one.
    await user.click(screen.getByRole('radio', { name: 'Bahasa Inggris' }));
    await user.click(await screen.findByRole('radio', { name: 'Indonesian' }));
    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('id');

    await user.click(screen.getByRole('button', { name: 'Hapus kemajuan dan riwayat' }));
    await user.click(await screen.findByRole('button', { name: 'Ya, hapus sekarang' }));

    expect(await screen.findByTestId('history-empty')).toBeInTheDocument();
    expect(screen.getByText('0/5')).toBeInTheDocument();
    expect(window.localStorage.getItem(PROGRESS_STORAGE_KEY)).toBeNull();
    // The locale preference is stored under its own key and must survive.
    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('id');
  });
});

describe('unavailable or corrupt storage', () => {
  it('renders the empty state instead of crashing when storage is corrupt', async () => {
    window.localStorage.setItem(PROGRESS_STORAGE_KEY, '{broken');
    resetProgressCache();
    resetNavigation('/riwayat');

    renderApp(<FlowHarness />);
    expect(await screen.findByTestId('history-empty')).toBeInTheDocument();
    expect(screen.getByText('0/5')).toBeInTheDocument();
  });

  it('keeps working when writing to storage fails', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    const { user } = renderApp(<FlowHarness />);
    await answerScenarioSafely(user);

    // The session still reflects the answer even though nothing could be persisted.
    navigationState.pathname = '/riwayat';
    expect(await screen.findByText('1/5')).toBeInTheDocument();
    vi.restoreAllMocks();
  });
});

describe('language switching does not disturb progress', () => {
  it('keeps progress and history counts across ID → EN → ID', async () => {
    const { user } = renderApp(<FlowHarness />);
    await answerScenarioSafely(user);
    await runRealCheck(user);

    navigationState.pathname = '/riwayat';
    const before = within(await screen.findByTestId('history-list')).getAllByRole(
      'listitem',
    ).length;
    expect(screen.getByText('1/5')).toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: 'Bahasa Inggris' }));
    expect(await screen.findByText('Verification readiness')).toBeInTheDocument();
    expect(screen.getByText('1/5')).toBeInTheDocument();
    expect(
      within(screen.getByTestId('history-list')).getAllByRole('listitem'),
    ).toHaveLength(before);
    expect(screen.getByText('Offer check')).toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: 'Indonesian' }));
    expect(await screen.findByText('Kesiapan verifikasi')).toBeInTheDocument();
    expect(screen.getByText('1/5')).toBeInTheDocument();
    expect(
      within(screen.getByTestId('history-list')).getAllByRole('listitem'),
    ).toHaveLength(before);
  });
});
