import { beforeEach, describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import { renderApp } from '../helpers/render-app';
import { FlowHarness } from '../helpers/flow-harness';
import { resetNavigation } from '../helpers/navigation-mock';

beforeEach(() => resetNavigation('/app/periksa'));

describe('demo offer flow (TESTING.md 4.1)', () => {
  it('runs upload → confirmation → result without a dead end', async () => {
    const { user } = renderApp(<FlowHarness />);

    expect(
      screen.getByText(
        'Jangan unggah KTP, paspor, nomor identitas, atau dokumen yang memuat data pribadi sensitif.',
      ),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Gunakan contoh tawaran/i }));

    // Confirmation shows the canonical OCR-review notice and editable fields.
    expect(
      await screen.findByText(
        'Periksa kembali informasi berikut. Sistem dapat keliru membaca teks pada gambar.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Perusahaan / P3MI')).toHaveValue(
      'PT Karya Contoh Nusantara',
    );

    await user.click(screen.getByRole('button', { name: 'Lanjutkan pemeriksaan' }));

    expect(await screen.findByText('Tunda pembayaran dulu')).toBeInTheDocument();
    expect(screen.getByText('4 indikator risiko ditemukan')).toBeInTheDocument();
  });

  it('shows the indicator count equal to the rendered list', async () => {
    const { user } = renderApp(<FlowHarness />);
    await user.click(screen.getByRole('button', { name: /Gunakan contoh tawaran/i }));
    await user.click(
      await screen.findByRole('button', { name: 'Lanjutkan pemeriksaan' }),
    );

    const list = await screen.findByRole('list', {
      name: 'Daftar indikator risiko yang terpicu',
    });
    const rendered = within(list).getAllByRole('listitem');
    expect(
      screen.getByText(`${rendered.length} indikator risiko ditemukan`),
    ).toBeInTheDocument();
  });

  it('keeps company and contacting-channel results separate', async () => {
    const { user } = renderApp(<FlowHarness />);
    await user.click(screen.getByRole('button', { name: /Gunakan contoh tawaran/i }));
    await user.click(
      await screen.findByRole('button', { name: 'Lanjutkan pemeriksaan' }),
    );

    expect(await screen.findByText('Ditemukan di sumber resmi')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Perusahaannya ditemukan, tetapi identitas orang yang menghubungi Anda belum terbukti mewakili perusahaan tersebut.',
      ),
    ).toBeInTheDocument();
  });

  it('masks the contacting handle on the result screen', async () => {
    const { user } = renderApp(<FlowHarness />);
    await user.click(screen.getByRole('button', { name: /Gunakan contoh tawaran/i }));
    await user.click(
      await screen.findByRole('button', { name: 'Lanjutkan pemeriksaan' }),
    );

    await screen.findByText('Tunda pembayaran dulu');
    expect(document.body.textContent).not.toContain('+886 900 000 000');
    expect(document.body.textContent).toContain('•');
  });

  it('labels every demo screen', async () => {
    const { user } = renderApp(<FlowHarness />);
    await user.click(screen.getByRole('button', { name: /Gunakan contoh tawaran/i }));
    expect(await screen.findAllByText(/Contoh (hasil )?prototipe/i)).not.toHaveLength(0);

    await user.click(screen.getByRole('button', { name: 'Lanjutkan pemeriksaan' }));
    expect(await screen.findAllByText(/Contoh (hasil )?prototipe/i)).not.toHaveLength(0);
  });
});

describe('user correction reaches the rules (PRD FR-04)', () => {
  it('removes the personal-account indicator after the user corrects the account type', async () => {
    const { user } = renderApp(<FlowHarness />);
    await user.click(screen.getByRole('button', { name: /Gunakan contoh tawaran/i }));

    const accountSelect = await screen.findByLabelText('Jenis rekening');
    await user.selectOptions(accountSelect, 'company');
    await user.click(screen.getByRole('button', { name: 'Lanjutkan pemeriksaan' }));

    const list = await screen.findByRole('list', {
      name: 'Daftar indikator risiko yang terpicu',
    });
    const items = within(list).getAllByRole('listitem');
    expect(items).toHaveLength(3);
    expect(list.textContent).not.toContain('rekening pribadi');
  });

  it('propagates a corrected company name into the company evidence card', async () => {
    const { user } = renderApp(<FlowHarness />);
    await user.click(screen.getByRole('button', { name: /Gunakan contoh tawaran/i }));

    const companyInput = await screen.findByLabelText('Perusahaan / P3MI');
    await user.clear(companyInput);
    await user.type(companyInput, 'PT Nama Yang Tidak Terdaftar');
    await user.click(screen.getByRole('button', { name: 'Lanjutkan pemeriksaan' }));

    expect(await screen.findByText('PT Nama Yang Tidak Terdaftar')).toBeInTheDocument();
    expect(screen.queryByText('Ditemukan di sumber resmi')).not.toBeInTheDocument();
    expect(document.body.textContent).toContain(
      'Tidak ditemukan dalam cakupan sumber yang diperiksa',
    );
  });
});

describe('manual entry without OCR', () => {
  it('completes the flow from an empty form', async () => {
    const { user } = renderApp(<FlowHarness />);
    await user.click(screen.getByRole('button', { name: 'Tulis Manual' }));

    const companyInput = await screen.findByLabelText('Perusahaan / P3MI');
    await user.type(companyInput, 'PT Contoh Manual');
    await user.selectOptions(screen.getByLabelText('Jenis rekening'), 'personal');
    await user.selectOptions(screen.getByLabelText('Tenggat pembayaran'), 'same_day');
    await user.click(screen.getByRole('button', { name: 'Lanjutkan pemeriksaan' }));

    // No approved production dataset ships with this build, so the company check must
    // report "cannot be checked" rather than falling back to the demo dataset.
    expect(await screen.findByText('Tunda pembayaran dulu')).toBeInTheDocument();
    expect(screen.queryByText('Ditemukan di sumber resmi')).not.toBeInTheDocument();
    expect(
      screen.getAllByText(/Belum ada kumpulan data resmi yang disetujui/).length,
    ).toBeGreaterThan(0);
    expect(screen.queryByText(/Contoh hasil prototipe/)).not.toBeInTheDocument();
  });

  it('blocks continuing when no identifying claim was entered', async () => {
    const { user } = renderApp(<FlowHarness />);
    await user.click(screen.getByRole('button', { name: 'Tulis Manual' }));
    await user.click(
      await screen.findByRole('button', { name: 'Lanjutkan pemeriksaan' }),
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(/Periksa \d+ isian/);
  });
});

describe('ephemeral state (SECURITY.md 6)', () => {
  it('explains the loss instead of restoring the result after a reload', async () => {
    resetNavigation('/app/hasil');
    renderApp(<FlowHarness />);
    expect(
      await screen.findByText('Data pemeriksaan tidak tersedia lagi'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Mulai pemeriksaan baru' }),
    ).toBeInTheDocument();
  });

  it('writes no offer data to browser storage', async () => {
    const { user } = renderApp(<FlowHarness />);
    await user.click(screen.getByRole('button', { name: /Gunakan contoh tawaran/i }));
    await user.click(
      await screen.findByRole('button', { name: 'Lanjutkan pemeriksaan' }),
    );
    await screen.findByText('Tunda pembayaran dulu');

    const stored = Object.entries({ ...window.localStorage });
    for (const [, value] of stored) {
      expect(String(value)).not.toContain('Karya Contoh');
      expect(String(value)).not.toContain('886');
    }
    expect(window.sessionStorage.length).toBe(0);
  });
});
