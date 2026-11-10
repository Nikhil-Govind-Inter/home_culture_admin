import { apiFetch } from "@/lib/apiClient";
import { ApiError, parseEnvelope } from "@/services/auth/authApi";

// Career CMS — singleton backed by `/career-cms` (GET + multipart PUT).
// The PUT creates the record on first save (all six images are required then).
const CAREER_CMS_URL = `${import.meta.env.VITE_API_BASE_URL}/career-cms`;

export { ApiError };

export interface CareerCms {
  id?: number;

  life_at_home_status: boolean;
  life_at_home_header_title: string;
  life_at_home_title: string;
  life_at_home_quote: string;
  life_at_home_description: string;
  life_at_home_skills_title: string;

  why_join_us_status: boolean;
  why_join_us_header_title: string;
  why_join_us_title: string;
  why_join_us_description: string;

  media_one_path: string | null;
  media_one_alt: string;
  media_two_path: string | null;
  media_two_alt: string;
  media_three_path: string | null;
  media_three_alt: string;
  media_four_path: string | null;
  media_four_alt: string;

  current_opening_status: boolean;
  current_opening_header_title: string;
  current_opening_title: string;
  current_opening_description: string;

  testimonial_status: boolean;
  testimonial_header_title: string;
  testimonial_title: string;
  testimonial_description: string;

  cta_status: boolean;
  cta_desktop_media_path: string | null;
  cta_mobile_media_path: string | null;
  cta_media_alt: string;
  cta_header_title: string;
  cta_title: string;
  cta_description: string;
  cta_button_text: string;
  cta_button_link: string;
}

export const fetchCareerCms = async () =>
  parseEnvelope<CareerCms | null>(await apiFetch(CAREER_CMS_URL));

// Do not set Content-Type manually: the browser adds the multipart boundary.
export const saveCareerCms = async (formData: FormData) =>
  parseEnvelope<CareerCms>(
    await apiFetch(CAREER_CMS_URL, { method: "PUT", body: formData }),
  );
