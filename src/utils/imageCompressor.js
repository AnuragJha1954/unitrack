/**
 * Compresses and resizes an image file (File, Blob, or Data URL) to an ultra-lightweight WebP base64 string.
 * Optimized specifically for Neon Postgres 512 MB free tier quota!
 * Default settings (600x600 @ 0.65 quality) yield ~10 KB - 15 KB per photo, allowing up to ~25,000 photos stored
 * directly inside your Postgres database without requiring any payment cards or cloud subscriptions!
 */
export async function compressImageToWebP(input, maxWidth = 600, maxHeight = 600, quality = 0.65) {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image();
      let objectUrl = null;

      if (typeof input === 'string' && input.startsWith('data:')) {
        img.src = input;
      } else if (input instanceof File || input instanceof Blob) {
        objectUrl = URL.createObjectURL(input);
        img.src = objectUrl;
      } else {
        return resolve(input);
      }

      img.onload = () => {
        if (objectUrl) URL.revokeObjectURL(objectUrl);

        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const scale = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/webp', quality);
        resolve(compressedDataUrl);
      };

      img.onerror = (err) => {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        resolve(input);
      };
    } catch (e) {
      console.warn('Image compression fallback:', e);
      resolve(input);
    }
  });
}
