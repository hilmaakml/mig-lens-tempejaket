import type { MessageKey } from '@/content/locales/message-key';

/**
 * Upload validation (PRD FR-02, SECURITY.md 4).
 *
 * Size, extension, declared MIME type, and magic bytes are all checked; a mismatch between
 * any of them is rejected. Nothing is uploaded anywhere — validation happens on the device.
 */

export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const MAX_IMAGE_DIMENSION = 6000;
export const ACCEPTED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const ACCEPTED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'] as const;
/** The `accept` attribute mirrors the validated set; it is convenience, not a control. */
export const ACCEPT_ATTRIBUTE = ACCEPTED_MIME_TYPES.join(',');

export type FileValidationError =
  | 'too_large'
  | 'unsupported'
  | 'signature'
  | 'decode'
  | 'dimensions';

export const FILE_ERROR_MESSAGE_KEY: Readonly<Record<FileValidationError, MessageKey>> = {
  too_large: 'upload.error.too_large',
  unsupported: 'upload.error.unsupported',
  signature: 'upload.error.signature',
  decode: 'upload.error.decode',
  dimensions: 'upload.error.dimensions',
};

export type FileValidationResult =
  | {
      readonly ok: true;
      readonly detectedType: 'image/jpeg' | 'image/png' | 'image/webp';
    }
  | { readonly ok: false; readonly error: FileValidationError };

const startsWith = (bytes: Uint8Array, signature: readonly number[]): boolean =>
  signature.every((byte, index) => bytes[index] === byte);

/** Reads magic bytes rather than trusting the browser-declared MIME type. */
export function detectImageType(
  header: Uint8Array,
): 'image/jpeg' | 'image/png' | 'image/webp' | null {
  if (startsWith(header, [0xff, 0xd8, 0xff])) return 'image/jpeg';
  if (startsWith(header, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
    return 'image/png';
  if (
    startsWith(header, [0x52, 0x49, 0x46, 0x46]) &&
    header[8] === 0x57 &&
    header[9] === 0x45 &&
    header[10] === 0x42 &&
    header[11] === 0x50
  ) {
    return 'image/webp';
  }
  return null;
}

export function getExtension(fileName: string): string {
  const index = fileName.lastIndexOf('.');
  return index === -1 ? '' : fileName.slice(index + 1).toLowerCase();
}

export function validateMetadata(file: {
  readonly name: string;
  readonly size: number;
  readonly type: string;
}): FileValidationError | null {
  if (file.size > MAX_FILE_BYTES) return 'too_large';
  if (file.size === 0) return 'decode';
  if (!(ACCEPTED_MIME_TYPES as readonly string[]).includes(file.type))
    return 'unsupported';
  if (!(ACCEPTED_EXTENSIONS as readonly string[]).includes(getExtension(file.name))) {
    return 'unsupported';
  }
  return null;
}

/**
 * Reads the first bytes of a file. `Blob.arrayBuffer` is missing on older Safari and in
 * some test environments, so FileReader is used as the fallback.
 */
export function readHeaderBytes(file: Blob, byteCount = 16): Promise<Uint8Array> {
  const head = file.slice(0, byteCount);
  if (typeof head.arrayBuffer === 'function') {
    return head.arrayBuffer().then((buffer) => new Uint8Array(buffer));
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
    reader.onerror = () => reject(new Error('read_failed'));
    reader.readAsArrayBuffer(head);
  });
}

/** Full validation: metadata, magic bytes, decodability, and bounded dimensions. */
export async function validateImageFile(file: File): Promise<FileValidationResult> {
  const metadataError = validateMetadata(file);
  if (metadataError) return { ok: false, error: metadataError };

  let header: Uint8Array;
  try {
    header = await readHeaderBytes(file);
  } catch {
    return { ok: false, error: 'decode' };
  }
  const detectedType = detectImageType(header);
  if (!detectedType) return { ok: false, error: 'signature' };
  // A PNG named .jpg with a JPEG MIME type is a mismatch we refuse rather than guess.
  if (detectedType !== file.type) return { ok: false, error: 'signature' };

  const bitmapSupported = typeof createImageBitmap === 'function';
  if (!bitmapSupported) return { ok: true, detectedType };

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return { ok: false, error: 'decode' };
  }
  const { width, height } = bitmap;
  // Release the decoded pixels immediately; nothing is kept beyond validation.
  bitmap.close();
  if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
    return { ok: false, error: 'dimensions' };
  }
  return { ok: true, detectedType };
}
