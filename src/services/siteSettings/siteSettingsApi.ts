import { apiFetch } from "@/lib/apiClient";
import { ApiError, parseEnvelope } from "@/services/auth/authApi";

// Site settings — singleton backed by `/site-settings` (GET + multipart PUT).
// Logos go in `header_logo` and `footer_logo`; the PUT creates the record on first save.
const SITE_SETTINGS_URL = `${import.meta.env.VITE_API_BASE_URL}/site-settings`;

export { ApiError };

export interface SiteSettings {
  id?: number;
  header_logo?: string | null;
  footer_logo?: string | null;
  header_logo_alt: string;
  footer_logo_alt: string;
  header_button_text: string;
  header_button_link: string;
  footer_title: string;
  description: string;
  address: string;
  email: string;
  phone: string;
}

export const fetchSiteSettings = async () =>
  parseEnvelope<SiteSettings | null>(await apiFetch(SITE_SETTINGS_URL));

export const saveSiteSettings = async (formData: FormData) =>
  parseEnvelope<SiteSettings>(
    await apiFetch(SITE_SETTINGS_URL, { method: "PUT", body: formData }),
  );
