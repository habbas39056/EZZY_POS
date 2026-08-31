/**
 * Utilities for resizing, compressing, and validating product and category images.
 * Restricts images to a maximum of 300x300 pixels and optimizes them to lightweight Data URLs.
 */

export interface ProcessedImageResult {
  dataUrl: string;
  width: number;
  height: number;
  fileSizeKb: number;
  originalName: string;
}

/**
 * Loads a File into HTML5 Canvas, resizes it to max 300x300 px while maintaining aspect ratio,
 * and returns the optimized Base64 data URL and metadata.
 */
export async function resizeImageTo300x300(file: File): Promise<ProcessedImageResult> {
  // Validate MIME type
  if (!file.type.startsWith('image/')) {
    throw new Error('Please select a valid image file (JPG, PNG, WebP, GIF).');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to decode image data.'));
      img.onload = () => {
        const MAX_SIZE = 300;
        let { width, height } = img;

        // Calculate scaled dimensions (max 300x300)
        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        // Draw to canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not create 2D canvas context.'));
          return;
        }

        // Use high quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Export as WebP or JPEG for maximum compactness
        const format = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(format, 0.88);

        // Estimate size in KB
        const head = format === 'image/png' ? 'data:image/png;base64,' : 'data:image/jpeg;base64,';
        const base64Length = dataUrl.length - head.length;
        const fileSizeKb = Math.round((base64Length * 3) / 4 / 1024);

        resolve({
          dataUrl,
          width,
          height,
          fileSizeKb,
          originalName: file.name
        });
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
