import { apiFetch } from "@/lib/apiClient";
import { ApiError, parseEnvelope } from "@/services/auth/authApi";

// About CMS — singleton backed by `/about-cms` (GET + multipart PUT).
// The PUT creates the record on first save (all media files are required then).
const ABOUT_CMS_URL = `${import.meta.env.VITE_API_BASE_URL}/about-cms`;

export { ApiError };

export interface AboutCms {
  id?: number;

  story_section_status: boolean;
  story_section_media_path: string | null;
  story_section_media_alt: string;
  story_section_header_title: string;
  story_section_title: string;
  story_section_description: string;

  philosophy_section_status: boolean;
  philosophy_section_media_path: string | null;
  philosophy_section_media_alt: string;
  philosophy_section_header_title: string;
  philosophy_section_title: string;
  philosophy_section_description: string;

  mission_title: string;
  mission_icon: string | null;
  mission_description: string;

  vision_title: string;
  vision_icon: string | null;
  vision_description: string;

  highlight_section_status: boolean;
  highlight_section_header_title: string;
  highlight_section_title: string;

  promise_section_status: boolean;
  promise_section_left_media_path: string | null;
  promise_section_left_media_alt: string;
  promise_section_right_media_path: string | null;
  promise_section_right_media_alt: string;
  promise_section_header_title: string;
  promise_section_title: string;
  promise_section_description: string;

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

export const fetchAboutCms = async () =>
  parseEnvelope<AboutCms | null>(await apiFetch(ABOUT_CMS_URL));

// Do not set Content-Type manually: the browser adds the multipart boundary.
export const saveAboutCms = async (formData: FormData) =>
  parseEnvelope<AboutCms>(
    await apiFetch(ABOUT_CMS_URL, { method: "PUT", body: formData }),
  );
