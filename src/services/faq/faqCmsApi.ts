import { apiFetch } from "@/lib/apiClient";
import { ApiError, parseEnvelope } from "@/services/auth/authApi";

// FAQ CMS — singleton backed by `/faq-cms` (GET + multipart PUT).
// The PUT creates the record on first save (the section one image is required then).
const FAQ_CMS_URL = `${import.meta.env.VITE_API_BASE_URL}/faq-cms`;

export { ApiError };

export interface FaqCms {
  id?: number;

  section_one_status: boolean;
  section_one_media_path: string | null;
  section_one_media_alt: string;
  section_one_header_title: string;
  section_one_title: string;
  section_one_description: string;

  // Sidebar visibility
  status: boolean;
  sidebar_title: string;
  sidebar_quotes: string;

  section_two_status: boolean;
  section_two_header_title: string;
  section_two_title: string;
  section_two_description: string;
  section_two_button_text: string;
  section_two_button_link: string;
}

export const fetchFaqCms = async () =>
  parseEnvelope<FaqCms | null>(await apiFetch(FAQ_CMS_URL));

// Do not set Content-Type manually: the browser adds the multipart boundary.
export const saveFaqCms = async (formData: FormData) =>
  parseEnvelope<FaqCms>(
    await apiFetch(FAQ_CMS_URL, { method: "PUT", body: formData }),
  );
