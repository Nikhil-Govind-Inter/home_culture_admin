import { apiFetch } from "@/lib/apiClient";
import { ApiError, parseEnvelope } from "@/services/auth/authApi";

// Privacy Policy — singleton backed by `/privacy-policy` (GET + multipart PUT).
// The PUT creates the record on first save (both CTA images are required then).
const PRIVACY_POLICY_URL = `${import.meta.env.VITE_API_BASE_URL}/privacy-policy`;

export { ApiError };

export interface PrivacyPolicy {
  id?: number;

  content_section_status: boolean;
  content_section_side_title: string;
  content: string;

  cta_section_status: boolean;
  cta_section_desktop_media_path: string | null;
  cta_section_mobile_media_path: string | null;
  cta_section_media_alt: string;
  cta_section_header_title: string;
  cta_section_title: string;
  cta_section_description: string;
  cta_section_button_text: string;
  cta_section_button_link: string;
}

export const fetchPrivacyPolicy = async () =>
  parseEnvelope<PrivacyPolicy | null>(await apiFetch(PRIVACY_POLICY_URL));

// Do not set Content-Type manually: the browser adds the multipart boundary.
export const savePrivacyPolicy = async (formData: FormData) =>
  parseEnvelope<PrivacyPolicy>(
    await apiFetch(PRIVACY_POLICY_URL, { method: "PUT", body: formData }),
  );
