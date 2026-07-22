/**
 * 100% Free External Image Hosting Adapter via ImgBB Free API (`https://api.imgbb.com/1/upload`)
 * Requires zero billing cards, zero cloud fees, and consumes 0 bytes inside your Neon Postgres quota!
 * When enabled, uploads return a clean public HTTPS URL stored cleanly inside Postgres (`image_data`).
 */
class ImgbbService {
  constructor() {
    this.storageKey = 'unitrack_imgbb_config';
  }

  getConfig() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      return saved ? JSON.parse(saved) : { enabled: false, apiKey: '' };
    } catch (e) {
      return { enabled: false, apiKey: '' };
    }
  }

  saveConfig(config) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(config));
    } catch (e) {
      console.warn('Failed saving imgbb config:', e);
    }
  }

  /**
   * Uploads base64 or file to ImgBB if enabled. If not enabled or if error occurs, returns the input data directly.
   */
  async uploadImage(base64DataUrl) {
    const config = this.getConfig();
    if (!config.enabled || !config.apiKey || !config.apiKey.trim()) {
      return base64DataUrl; // Return local compressed WebP base64 directly
    }

    try {
      // Remove data:image/...;base64, prefix for ImgBB API
      const base64Clean = base64DataUrl.replace(/^data:image\/[a-z]+;base64,/, '');
      const formData = new FormData();
      formData.append('key', config.apiKey.trim());
      formData.append('image', base64Clean);

      const response = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (data && data.success && data.data && data.data.url) {
        return data.data.url; // Returns exact HTTPS URL!
      } else {
        console.warn('ImgBB upload error response, falling back to local WebP:', data);
        return base64DataUrl;
      }
    } catch (err) {
      console.warn('ImgBB upload network error, falling back to local WebP:', err);
      return base64DataUrl;
    }
  }
}

export const imgbbService = new ImgbbService();
