/**
 * Clipboard helper. Only redacted, allowlisted text is ever passed in
 * (SECURITY.md 7); this module does not read application state.
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Permission denied or unavailable: fall through to the manual-copy message.
  }
  return false;
}
