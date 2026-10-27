/**
 * Utility functions for image normalization, validation, and client-side compression.
 */

/**
 * Checks if a given string looks like an image URL or Data URL
 */
export function isImageUrl(str?: string | null): boolean {
  if (!str) return false;
  const s = str.trim().toLowerCase();
  return (
    s.startsWith('http://') ||
    s.startsWith('https://') ||
    s.startsWith('data:image/') ||
    s.startsWith('blob:') ||
    s.startsWith('/')
  );
}

/**
 * Normalizes external image links (Google Drive, Dropbox, Wikipedia) to direct embeddable URLs
 */
export function normalizeImageUrl(inputUrl?: string | null): string {
  if (!inputUrl) return '';
  const trimmed = inputUrl.trim();

  // If already a Data URL, return as-is
  if (trimmed.startsWith('data:image/')) {
    return trimmed;
  }

  // Google Drive sharing links:
  // e.g. https://drive.google.com/file/d/1A2B3C.../view?usp=sharing
  // or https://drive.google.com/open?id=1A2B3C...
  // or https://drive.google.com/uc?export=view&id=1A2B3C...
  const gDriveFileMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (gDriveFileMatch && gDriveFileMatch[1]) {
    return `https://drive.google.com/thumbnail?id=${gDriveFileMatch[1]}&sz=w800`;
  }

  const gDriveIdMatch = trimmed.match(/drive\.google\.com\/(?:open|uc)\?(?:[^&]*&)*id=([a-zA-Z0-9_-]+)/);
  if (gDriveIdMatch && gDriveIdMatch[1]) {
    return `https://drive.google.com/thumbnail?id=${gDriveIdMatch[1]}&sz=w800`;
  }

  // Dropbox links: replace ?dl=0 with ?raw=1
  if (trimmed.includes('dropbox.com') && trimmed.includes('dl=0')) {
    return trimmed.replace('dl=0', 'raw=1');
  }

  return trimmed;
}

/**
 * Reads an image file from disk and compresses it into a lightweight Data URL (JPEG/WebP)
 * so it can be saved directly in Firestore and displayed reliably on all devices without CORS.
 */
export function compressAndReadImage(file: File, maxDimension = 500, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    // If SVG or GIF, preserve directly to retain animation/vector crispness
    if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Scale down if larger than maxDimension
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(readerEvent.target?.result as string);
          return;
        }

        // Draw image with smooth scaling
        ctx.drawImage(img, 0, 0, width, height);

        // Try WebP, fallback to JPEG
        try {
          const dataUrl = canvas.toDataURL('image/webp', quality);
          if (dataUrl.startsWith('data:image/webp')) {
            resolve(dataUrl);
            return;
          }
        } catch (e) {
          // ignore
        }

        const jpegUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(jpegUrl);
      };
      img.onerror = () => {
        // Fallback to raw data url if canvas fails
        resolve(readerEvent.target?.result as string);
      };
      img.src = readerEvent.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
