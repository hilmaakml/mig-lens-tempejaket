import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderApp } from '../helpers/render-app';
import { FlowHarness } from '../helpers/flow-harness';
import { getRoute, resetNavigation } from '../helpers/navigation-mock';
import { OcrError } from '@/features/offer-input/ocr-runner';

const startOcrMock = vi.hoisted(() => vi.fn());

vi.mock('@/features/offer-input/ocr-runner', async () => {
  const actual = await vi.importActual<
    typeof import('@/features/offer-input/ocr-runner')
  >('@/features/offer-input/ocr-runner');
  return { ...actual, startOcr: startOcrMock };
});

const JPEG_BYTES = new Uint8Array([
  0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
]);
const PNG_BYTES = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0, 0, 0, 0, 0,
]);

const makeFile = (name: string, type: string, bytes: Uint8Array) =>
  new File([bytes.buffer as ArrayBuffer], name, { type });

beforeEach(() => {
  resetNavigation('/periksa');
  startOcrMock.mockReset();
});

describe('upload validation in the UI (PRD FR-02)', () => {
  it('shows the privacy warning before any file control', () => {
    renderApp(<FlowHarness />);
    const warning = screen.getByText(
      'Jangan unggah KTP, paspor, nomor identitas, atau dokumen yang memuat data pribadi sensitif.',
    );
    const fileButton = screen.getByRole('button', { name: 'File' });
    expect(
      warning.compareDocumentPosition(fileButton) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('rejects a file whose contents do not match its declared type', async () => {
    const { user } = renderApp(<FlowHarness />);
    const input = screen.getByLabelText('File');
    await user.upload(input, makeFile('offer.jpg', 'image/jpeg', PNG_BYTES));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Isi berkas tidak cocok dengan formatnya. Pilih gambar lain.',
    );
    expect(startOcrMock).not.toHaveBeenCalled();
  });

  it('rejects an unsupported extension even when the MIME type looks acceptable', async () => {
    const { user } = renderApp(<FlowHarness />);
    const input = screen.getByLabelText('File');
    // The `accept` attribute filters by MIME only, so a disguised extension still has to be
    // caught by the application's own validation.
    await user.upload(input, makeFile('offer.exe', 'image/jpeg', JPEG_BYTES));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Format berkas tidak didukung. Gunakan JPG, PNG, atau WebP.',
    );
  });

  it('does not retain the rejected file when the user retries', async () => {
    const { user } = renderApp(<FlowHarness />);
    const input = screen.getByLabelText('File') as HTMLInputElement;
    await user.upload(input, makeFile('offer.jpg', 'image/jpeg', PNG_BYTES));
    await screen.findByRole('alert');
    expect(input.files?.length ?? 0).toBe(0);
    expect(screen.queryByText(/Berkas dipilih/)).not.toBeInTheDocument();
  });

  it('accepts a valid image and starts on-device reading', async () => {
    let resolveText: (value: string) => void = () => {};
    startOcrMock.mockImplementation(() => ({
      done: new Promise<string>((resolve) => {
        resolveText = resolve;
      }),
      cancel: vi.fn(),
    }));

    const { user } = renderApp(<FlowHarness />);
    await user.upload(
      screen.getByLabelText('File'),
      makeFile('offer.jpg', 'image/jpeg', JPEG_BYTES),
    );

    expect(await screen.findByRole('progressbar')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Batalkan pembacaan' }),
    ).toBeInTheDocument();

    resolveText('PT Contoh Uji mencari Caregiver di Taiwan, WhatsApp 081234567890');
    expect(await screen.findByLabelText('Perusahaan / P3MI')).toHaveValue(
      'PT Contoh Uji',
    );
    expect(screen.getByLabelText('Posisi pekerjaan')).toHaveValue('Caregiver');
    expect(getRoute()).toBe('/konfirmasi');
  });

  it('falls back to manual entry when reading fails', async () => {
    startOcrMock.mockImplementation(() => ({
      done: Promise.reject(new OcrError('failed')),
      cancel: vi.fn(),
    }));

    const { user } = renderApp(<FlowHarness />);
    await user.upload(
      screen.getByLabelText('File'),
      makeFile('offer.jpg', 'image/jpeg', JPEG_BYTES),
    );

    expect(await screen.findByText('Teks tidak dapat dibaca')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Isi manual saja' }));
    expect(getRoute()).toBe('/konfirmasi');
    expect(await screen.findByLabelText('Perusahaan / P3MI')).toHaveValue('');
  });

  it('returns to the idle state when reading is cancelled', async () => {
    const cancel = vi.fn();
    startOcrMock.mockImplementation(() => ({
      done: new Promise<string>(() => {}),
      cancel,
    }));

    const { user } = renderApp(<FlowHarness />);
    await user.upload(
      screen.getByLabelText('File'),
      makeFile('offer.jpg', 'image/jpeg', JPEG_BYTES),
    );
    await user.click(await screen.findByRole('button', { name: 'Batalkan pembacaan' }));

    expect(cancel).toHaveBeenCalled();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(getRoute()).toBe('/periksa');
  });

  it('states that the image stays on the device', () => {
    renderApp(<FlowHarness />);
    expect(
      screen.getByText(/Gambar tidak dikirim ke server MigLens/),
    ).toBeInTheDocument();
  });

  it('only offers the supported image formats', () => {
    renderApp(<FlowHarness />);
    expect(screen.getByText('JPG, PNG, atau WebP (maksimal 10 MB)')).toBeInTheDocument();
    const input = screen.getByLabelText('File');
    expect(input).toHaveAttribute('accept', 'image/jpeg,image/png,image/webp');
  });
});
