import { beforeEach, describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import { renderApp } from '../helpers/render-app';
import { FlowHarness } from '../helpers/flow-harness';
import { resetNavigation, getRoute } from '../helpers/navigation-mock';
import { LOCALE_STORAGE_KEY } from '@/domain/privacy/locale-storage';

beforeEach(() => resetNavigation('/app/periksa'));

const switchTo = async (
  user: ReturnType<typeof renderApp>['user'],
  language: 'Bahasa Indonesia' | 'Bahasa Inggris' | 'Indonesian' | 'English',
) => {
  await user.click(screen.getByRole('radio', { name: language }));
};

describe('state-preserving language switching (DESIGN.md 2, TESTING.md 3)', () => {
  it('keeps route, corrected claims, statuses, and indicator count across ID → EN → ID', async () => {
    const { user } = renderApp(<FlowHarness />);
    await user.click(screen.getByRole('button', { name: /Gunakan contoh tawaran/i }));

    const companyInput = await screen.findByLabelText('Perusahaan / P3MI');
    await user.clear(companyInput);
    await user.type(companyInput, 'PT Karya Contoh Nusantara');
    await user.click(screen.getByRole('button', { name: 'Lanjutkan pemeriksaan' }));

    const idList = await screen.findByRole('list', {
      name: 'Daftar indikator risiko yang terpicu',
    });
    const idCount = within(idList).getAllByRole('listitem').length;
    expect(screen.getByText(`${idCount} indikator risiko ditemukan`)).toBeInTheDocument();

    await switchTo(user, 'Bahasa Inggris');

    // Same route, same result, English copy.
    expect(getRoute()).toBe('/app/hasil');
    expect(await screen.findByText('Hold off on paying')).toBeInTheDocument();
    const enList = screen.getByRole('list', {
      name: 'List of triggered risk indicators',
    });
    expect(within(enList).getAllByRole('listitem')).toHaveLength(idCount);
    expect(screen.getByText(`${idCount} risk indicators found`)).toBeInTheDocument();
    expect(screen.getByText('Found in the source checked')).toBeInTheDocument();

    await switchTo(user, 'Indonesian');

    expect(await screen.findByText('Tunda pembayaran dulu')).toBeInTheDocument();
    expect(screen.getByText('Ditemukan di sumber resmi')).toBeInTheDocument();
    expect(getRoute()).toBe('/app/hasil');
  });

  it('keeps entered form values when the language changes mid-form', async () => {
    const { user } = renderApp(<FlowHarness />);
    await user.click(screen.getByRole('button', { name: 'Tulis Manual' }));

    const companyInput = await screen.findByLabelText('Perusahaan / P3MI');
    await user.type(companyInput, 'PT Contoh Bahasa');
    await switchTo(user, 'Bahasa Inggris');

    expect(await screen.findByLabelText('Company / P3MI')).toHaveValue(
      'PT Contoh Bahasa',
    );
    expect(
      screen.getByText(
        'Please re-check the information below. The system can misread text in an image.',
      ),
    ).toBeInTheDocument();
  });

  it('persists only the locale enum', async () => {
    const { user } = renderApp(<FlowHarness />);
    await switchTo(user, 'Bahasa Inggris');
    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('en');
    expect(window.localStorage.length).toBe(1);
  });

  it('updates the document language', async () => {
    const { user } = renderApp(<FlowHarness />);
    await switchTo(user, 'Bahasa Inggris');
    expect(document.documentElement.lang).toBe('en-GB');
    await switchTo(user, 'Indonesian');
    expect(document.documentElement.lang).toBe('id-ID');
  });

  it('exposes an accessible, labelled control with a visible selected state', () => {
    renderApp(<FlowHarness />);
    const group = screen.getByRole('radiogroup', {
      name: 'Pilih bahasa / Choose language',
    });
    const options = within(group).getAllByRole('radio');
    expect(options).toHaveLength(2);
    expect(
      options.filter((option) => option.getAttribute('aria-checked') === 'true'),
    ).toHaveLength(1);
  });

  it('renders no raw translation key on either screen', async () => {
    const { user } = renderApp(<FlowHarness />);
    await user.click(screen.getByRole('button', { name: /Gunakan contoh tawaran/i }));
    await user.click(
      await screen.findByRole('button', { name: 'Lanjutkan pemeriksaan' }),
    );
    await switchTo(user, 'Bahasa Inggris');

    const text = document.body.textContent ?? '';
    expect(text).not.toMatch(/\b(result|check|rule|status|missing)\.[a-z_]+\.[a-z_]+/);
    expect(text).not.toContain('{');
  });

  it('carries the limitation notice in English too', async () => {
    const { user } = renderApp(<FlowHarness />);
    await user.click(screen.getByRole('button', { name: /Gunakan contoh tawaran/i }));
    await user.click(
      await screen.findByRole('button', { name: 'Lanjutkan pemeriksaan' }),
    );
    await switchTo(user, 'Bahasa Inggris');

    expect(
      await screen.findByText(/not a legal decision and not a guarantee/),
    ).toBeInTheDocument();
  });
});
