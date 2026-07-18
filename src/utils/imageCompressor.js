/**
 * Compresses and resizes an image file (File, Blob, or Data URL) to a lightweight WebP base64 string.
 * This keeps images around ~20-50 KB so they can be stored 100% FREE inside Neon Postgres and IndexedDB
 * without requiring any third-party cloud storage or payment cards!
 */
export async function compressImageToWebP(input, maxWidth = 900, maxHeight = 900, quality = 0.75) {
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
        // If image loading fails, return original input
        resolve(input);
      };
    } catch (e) {
      console.warn('Image compression fallback:', e);
      resolve(input);
    }
  });
}
