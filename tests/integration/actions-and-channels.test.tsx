import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import { renderApp } from '../helpers/render-app';
import { FlowHarness } from '../helpers/flow-harness';
import { resetNavigation } from '../helpers/navigation-mock';
import { demoOfferClaim } from '@data/fixtures/demo-offer';

beforeEach(() => resetNavigation('/periksa'));

const runDemoCheck = async (user: ReturnType<typeof renderApp>['user']) => {
  await user.click(screen.getByRole('button', { name: /Gunakan contoh tawaran/i }));
  await user.click(await screen.findByRole('button', { name: 'Lanjutkan pemeriksaan' }));
  await screen.findByText('Tunda pembayaran dulu');
};

function mockClipboard() {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText },
    configurable: true,
    writable: true,
  });
  return writeText;
}

describe('evidence map accordions (TESTING.md 3)', () => {
  it('exposes aria-expanded and aria-controls and toggles by keyboard', async () => {
    const { user } = renderApp(<FlowHarness />);
    await runDemoCheck(user);

    const trigger = screen.getByRole('button', { name: /Perusahaan \/ P3MI/ });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveAttribute('aria-controls');

    trigger.focus();
    await user.keyboard('{Enter}');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('renders reason, source, dates, limitation, and next action together', async () => {
    const { user } = renderApp(<FlowHarness />);
    await runDemoCheck(user);

    await user.click(
      screen.getByRole('button', { name: /Identitas & kanal penghubung/ }),
    );
    const region = screen.getByRole('region', { name: /Identitas & kanal penghubung/ });

    expect(within(region).getByText(/Alasan/)).toBeInTheDocument();
    expect(within(region).getByText(/Sumber/)).toBeInTheDocument();
    expect(within(region).getByText(/Diperiksa/)).toBeInTheDocument();
    expect(within(region).getByText(/Masih kurang/)).toBeInTheDocument();
    expect(within(region).getByText(/Batas pemeriksaan ini/)).toBeInTheDocument();
    expect(within(region).getByText(/Berikutnya/)).toBeInTheDocument();
  });

  it('shows the rule id and version for a rule-based item', async () => {
    const { user } = renderApp(<FlowHarness />);
    await runDemoCheck(user);
    await user.click(screen.getByRole('button', { name: /Tekanan waktu/ }));
    const region = screen.getByRole('region', { name: /Tekanan waktu/ });
    expect(
      within(region).getByText(/TIME_PRESSURE_IMMEDIATE_TRANSFER/),
    ).toBeInTheDocument();
    expect(within(region).getByText(/1\.0\.0/)).toBeInTheDocument();
  });
});

describe('verification message (PRD FR-12)', () => {
  it('previews the reviewed template and announces a successful copy', async () => {
    const { user } = renderApp(<FlowHarness />);
    // userEvent.setup() installs its own clipboard stub, so replace it afterwards.
    const writeText = mockClipboard();
    await runDemoCheck(user);

    await user.click(screen.getByRole('link', { name: 'Buat pesan verifikasi' }));
    expect(
      await screen.findByText(
        'Mohon kirimkan tautan lowongan resmi, nama dan nomor izin P3MI, draf kontrak, rincian biaya tertulis, serta kontak kantor resmi yang dapat saya hubungi untuk melakukan verifikasi.',
      ),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Salin pesan' }));
    expect(await screen.findByTestId('toast')).toHaveTextContent('Pesan disalin.');
    expect(screen.getByRole('status')).toHaveTextContent('Pesan disalin.');

    // The copied text carries no offer content.
    const copied = writeText.mock.calls[0]?.[0] as string;
    expect(copied).not.toContain(demoOfferClaim.companyName);
    expect(copied).not.toContain('886');
  });
});

describe('redacted share preview (PRD FR-13)', () => {
  it('previews a redacted summary and copies only that text', async () => {
    const { user } = renderApp(<FlowHarness />);
    // userEvent.setup() installs its own clipboard stub, so replace it afterwards.
    const writeText = mockClipboard();
    await runDemoCheck(user);

    await user.click(screen.getByRole('link', { name: 'Bagikan ringkasan' }));
    const preview = await screen.findByTestId('share-preview');

    expect(preview.textContent).not.toContain(demoOfferClaim.companyName);
    expect(preview.textContent).not.toContain('900 000 000');
    expect(preview.textContent).toContain('Caregiver');
    expect(preview.textContent).toContain('Contoh hasil prototipe');

    await user.click(screen.getByRole('button', { name: 'Salin ringkasan' }));
    const copied = writeText.mock.calls[0]?.[0] as string;
    expect(copied).not.toContain(demoOfferClaim.companyName);
    expect(copied).not.toContain('900000000');
    expect(copied).toContain('bukan keputusan hukum');
    expect(await screen.findByTestId('toast')).toHaveTextContent('Ringkasan disalin.');
  });

  it('warns that the device share menu is outside the app', async () => {
    const { user } = renderApp(<FlowHarness />);
    await runDemoCheck(user);
    await user.click(screen.getByRole('link', { name: 'Bagikan ringkasan' }));
    expect(await screen.findByText(/menu berbagi milik perangkat/i)).toBeInTheDocument();
  });
});

describe('complaint channels (PRD FR-12)', () => {
  it('never leads to a dead end and marks the recommended channels', async () => {
    const { user } = renderApp(<FlowHarness />);
    await runDemoCheck(user);

    await user.click(screen.getByRole('link', { name: /Laporkan tawaran atau kontak/ }));

    const aduan = await screen.findByText('AduanNomor');
    const aduanCard = aduan.closest('section');
    expect(aduanCard).not.toBeNull();
    expect(
      within(aduanCard!).getByText('Direkomendasikan untuk kasus Anda'),
    ).toBeVisible();

    const cek = screen.getByText('CekRekening').closest('section');
    expect(within(cek!).getByText('Direkomendasikan untuk kasus Anda')).toBeVisible();
  });

  it('opens allowlisted external links with safe attributes and a visible domain', async () => {
    const { user } = renderApp(<FlowHarness />);
    await runDemoCheck(user);
    await user.click(screen.getByRole('link', { name: /Laporkan tawaran atau kontak/ }));

    const link = await screen.findByRole('link', { name: /Buka AduanNomor/ });
    expect(link).toHaveAttribute('href', 'https://aduannomor.id/');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
    expect(link).toHaveAttribute('rel', expect.stringContaining('noreferrer'));
    expect(link).toHaveAttribute('target', '_blank');
    expect(link.textContent).toContain('aduannomor.id');
  });

  it('shows an unavailable state plus an approved alternative for an unreviewed destination', async () => {
    const { user } = renderApp(<FlowHarness />);
    await runDemoCheck(user);
    await user.click(screen.getByRole('link', { name: /Laporkan tawaran atau kontak/ }));

    const kp2mi = (await screen.findByText('Kanal pengaduan KP2MI/BP2MI')).closest(
      'section',
    );
    expect(
      within(kp2mi!).getByText('Kanal pengaduan digital belum tersedia'),
    ).toBeVisible();
    expect(
      within(kp2mi!).queryByRole('link', { name: /Buka Kanal pengaduan/ }),
    ).toBeNull();
    expect(
      within(kp2mi!).getByRole('link', { name: /Buka SISKOP2MI — daftar P3MI/ }),
    ).toBeInTheDocument();
  });

  it('states that MigranShield sends no report or offer data', async () => {
    const { user } = renderApp(<FlowHarness />);
    await runDemoCheck(user);
    await user.click(screen.getByRole('link', { name: /Laporkan tawaran atau kontak/ }));

    expect(
      await screen.findByText(/MigranShield tidak mengirim laporan atau data tawaran/),
    ).toBeInTheDocument();
  });

  it('puts no offer content in any external href', async () => {
    const { user } = renderApp(<FlowHarness />);
    await runDemoCheck(user);
    await user.click(screen.getByRole('link', { name: /Laporkan tawaran atau kontak/ }));

    const externals = screen
      .getAllByRole('link')
      .map((link) => link.getAttribute('href') ?? '')
      .filter((href) => href.startsWith('http'));
    expect(externals.length).toBeGreaterThan(0);
    for (const href of externals) {
      expect(href).not.toContain('?');
      expect(href).not.toContain('#');
      expect(href).not.toContain('900000000');
      expect(href).not.toContain('Karya');
    }
  });

  it('offers no contact built from the offer number', async () => {
    const { user } = renderApp(<FlowHarness />);
    await runDemoCheck(user);
    await user.click(screen.getByRole('link', { name: 'Lihat sumber resmi' }));

    expect(document.body.textContent).not.toContain('+886 900 000 000');
    expect(
      await screen.findByText(/Belum ada kontak resmi dari sumber yang disetujui/),
    ).toBeInTheDocument();
  });
});

describe('personal exercise routing (PRD FR-14)', () => {
  it('recommends the exercise matching the unresolved contact', async () => {
    const { user } = renderApp(<FlowHarness />);
    await runDemoCheck(user);

    expect(
      screen.getByText(
        'Latihan ini direkomendasikan berdasarkan bagian yang masih perlu Anda verifikasi.',
      ),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'Mulai latihan personal' }));
    const recommended = await screen.findByText('Direkomendasikan untuk Anda');
    expect(recommended).toBeInTheDocument();
    expect(screen.getAllByText('Pencatutan Identitas Lembaga').length).toBeGreaterThan(0);
  });
});
