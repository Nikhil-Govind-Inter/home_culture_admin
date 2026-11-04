import { apiFetch } from "@/lib/apiClient";
import { ApiError, parseEnvelope } from "@/services/auth/authApi";

// Contact CMS — singleton backed by `/admin/contact-cms` (GET + PUT, JSON body).
const CONTACT_CMS_URL = `${import.meta.env.VITE_API_BASE_URL}/contact-cms`;

export { ApiError };

export interface ContactCms {
  id?: number;
  title: string;
  description: string;
  form_title: string;
  social_media_title: string;
  map_url: string;
}

export const fetchContactCms = async () =>
  parseEnvelope<ContactCms | null>(await apiFetch(CONTACT_CMS_URL));

export const saveContactCms = async (payload: ContactCms) =>
  parseEnvelope<ContactCms>(
    await apiFetch(CONTACT_CMS_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  );
