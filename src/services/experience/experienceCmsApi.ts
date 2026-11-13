import { apiFetch } from "@/lib/apiClient";
import { ApiError, parseEnvelope } from "@/services/auth/authApi";

// Experience CMS — singleton backed by `/experience-cms` (GET + multipart PUT).
// The PUT creates the record on first save (both media files are required then;
// the visit thumbnail only when the visit media is a video).
const EXPERIENCE_CMS_URL = `${import.meta.env.VITE_API_BASE_URL}/experience-cms`;

export { ApiError };

export interface ExperienceCms {
  id?: number;

  intro_section_status: boolean;
  intro_section_media_path: string | null;
  intro_section_media_alt: string;
  intro_section_header_title: string;
  intro_section_title: string;
  intro_section_quote: string;
  intro_section_description: string;

  journey_section_status: boolean;
  journey_section_header_title: string;
  journey_section_title: string;
  journey_section_description: string;

  lifestyle_status: boolean;
  lifestyle_header_title: string;
  lifestyle_title: string;
  lifestyle_description: string;

  visit_section_status: boolean;
  visit_section_media_type: "image" | "video";
  visit_section_media_path: string | null;
  visit_section_thumbnail: string | null;
  visit_section_media_alt: string;
  visit_section_header_title: string;
  visit_section_title: string;
  visit_section_description: string;

  feature_section_status: boolean;
  feature_section_header_title: string;
  feature_section_title: string;

  booking_process_status: boolean;
  booking_process_header_title: string;
  booking_process_title: string;

  faq_section_status: boolean;
  faq_section_header_title: string;
  faq_section_title: string;
  faq_section_description: string;

  enquiry_section_status: boolean;
  enquiry_section_header_title: string;
  enquiry_section_title: string;
  enquiry_section_description: string;
}

// The server answers 404 until the first save: treat that as "no content yet".
export const fetchExperienceCms = async (): Promise<{ data: ExperienceCms | null }> => {
  const response = await apiFetch(EXPERIENCE_CMS_URL);
  if (response.status === 404) return { data: null };
  return parseEnvelope<ExperienceCms>(response);
};

// Do not set Content-Type manually: the browser adds the multipart boundary.
export const saveExperienceCms = async (formData: FormData) =>
  parseEnvelope<ExperienceCms>(
    await apiFetch(EXPERIENCE_CMS_URL, { method: "PUT", body: formData }),
  );
