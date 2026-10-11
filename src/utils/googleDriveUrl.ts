/**
 * Utility to convert Google Drive sharing links into direct embeddable image URLs.
 * Supports:
 * - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 * - https://drive.google.com/file/d/FILE_ID/view
 * - https://drive.google.com/open?id=FILE_ID
 * - https://drive.google.com/uc?id=FILE_ID
 * - https://drive.google.com/uc?export=view&id=FILE_ID
 * - https://docs.google.com/uc?id=FILE_ID
 */

export function normalizeImageUrl(url: string | null | undefined): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // Extract Google Drive File ID:
  // Pattern 1: /file/d/{FILE_ID}
  const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch && fileDMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${fileDMatch[1]}`;
  }

  // Pattern 2: id={FILE_ID} on drive.google.com or docs.google.com
  const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (
    idMatch &&
    idMatch[1] &&
    (trimmed.includes('drive.google.com') ||
      trimmed.includes('docs.google.com') ||
      trimmed.includes('googleusercontent.com'))
  ) {
    return `https://lh3.googleusercontent.com/d/${idMatch[1]}`;
  }

  return trimmed;
}

/**
 * Checks if a string contains a Google Drive URL
 */
export function isGoogleDriveUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false;
  return url.includes('drive.google.com') || url.includes('docs.google.com');
}
