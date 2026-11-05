import { apiFetch } from "@/lib/apiClient";
import { ApiError, parseEnvelope } from "@/services/auth/authApi";

// Contact CMS — singleton backed by `/admin/contact-cms` (GET + PUT, JSON body).
const CONTACT_CMS_URL = `${import.meta.env.VITE_API_BASE_URL}/contact-cms`;

export { ApiError };

export interface ContactCms {
  id?: number;
  form_section_status: boolean;
  form_section_title: string;
  form_section_description: string;
  google_map_link: string;
  form_title: string;
  form_description: string;
  faq_section_status: boolean;
  faq_section_title: string;
  faq_section_description: string;
  faq_section_button_text: string;
  faq_section_button_link: string;
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
