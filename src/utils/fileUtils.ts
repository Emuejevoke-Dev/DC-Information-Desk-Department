/**
 * File & Image Utilities for Dominion City Asaba Information Desk Management System
 * Supports mobile camera capture, gallery selection, desktop file drag-and-drop,
 * automatic canvas compression, and Base64 conversion for persistent storage.
 */

export interface ProcessedImage {
  dataUrl: string;
  name: string;
  sizeBytes: number;
  width: number;
  height: number;
}

/**
 * Compresses an image file using an offscreen HTML Canvas
 * Resizes max dimension to maxWidthOrHeight (default 1200px) and quality 0.82
 * Keeps Base64 strings compact (typically 60KB - 250KB) while maintaining crisp visual quality.
 */
export const compressImageFile = (
  file: File,
  maxWidthOrHeight = 1200,
  quality = 0.82
): Promise<ProcessedImage> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Selected file is not an image'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image into memory'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio-preserved bounding dimensions
        if (width > height) {
          if (width > maxWidthOrHeight) {
            height = Math.round((height * maxWidthOrHeight) / width);
            width = maxWidthOrHeight;
          }
        } else {
          if (height > maxWidthOrHeight) {
            width = Math.round((width * maxWidthOrHeight) / height);
            height = maxWidthOrHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback if canvas context fails
          resolve({
            dataUrl: event.target?.result as string,
            name: file.name,
            sizeBytes: file.size,
            width: img.width,
            height: img.height,
          });
          return;
        }

        // Draw image smoothly
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to web-standard JPEG or WebP data URL
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        const approxSizeBytes = Math.round((dataUrl.length * 3) / 4);

        resolve({
          dataUrl,
          name: file.name,
          sizeBytes: approxSizeBytes,
          width,
          height,
        });
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Direct file to Base64 data URL conversion
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return compressImageFile(file).then((res) => res.dataUrl);
};

/**
 * Format bytes into human-readable string (KB, MB)
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};
