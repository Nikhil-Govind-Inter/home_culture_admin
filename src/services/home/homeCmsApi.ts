import { apiFetch } from "@/lib/apiClient";
import { ApiError, parseEnvelope } from "@/services/auth/authApi";

// Home CMS — singleton backed by `/home-cms` (GET + multipart PUT).
// The PUT creates the record on first save (all media files are required then).
const HOME_CMS_URL = `${import.meta.env.VITE_API_BASE_URL}/home-cms`;

export { ApiError };

export type HomeMediaType = "image" | "video";

export interface HomeCms {
  id?: number;

  challenges_section_status: boolean;
  challenges_section_header_title: string;
  challenges_section_title: string;
  challenges_section_description: string;
  challenges_section_right_title: string;
  challenges_section_button_text: string;
  challenges_section_button_link: string;

  ownership_status: boolean;
  ownership_media_type: HomeMediaType;
  ownership_desktop_media_path: string | null;
  ownership_mobile_media_path: string | null;
  ownership_mobile_media_alt: string;
  ownership_thumbnail: string | null;
  ownership_header_title: string;
  ownership_title: string;
  ownership_description: string;
  ownership_choose_title: string;
  ownership_button_text: string;
  ownership_button_link: string;

  welcome_section_status: boolean;
  welcome_section_header_title: string;
  welcome_section_title: string;
  welcome_section_description: string;

  style_section_status: boolean;
  style_section_title: string;

  experience_section_status: boolean;
  experience_section_header_title: string;
  experience_section_title: string;
  modal_title: string;
  modal_description: string;
  button_one_text: string;
  button_one_link: string;
  button_two_text: string;
  phone: string;
  whatsapp_number: string;

  journey_section_status: boolean;
  journey_section_header_title: string;
  journey_section_title: string;
  journey_section_media_type: HomeMediaType;
  journey_section_desktop_media_path: string | null;
  journey_section_mobile_media_path: string | null;
  journey_section_media_alt: string;
  journey_section_thumbnail: string | null;
  journey_section_description: string;
  journey_section_button_text: string;
  journey_section_button_link: string;

  insights_status: boolean;
  insights_header_title: string;
  insights_title: string;
  insights_description: string;
  insights_button_text: string;
  insights_button_link: string;

  cta_status: boolean;
  cta_desktop_media_path: string | null;
  cta_mobile_media_path: string | null;
  cta_media_alt: string;
  cta_header_title: string;
  cta_title: string;
  cta_description: string;
  cta_button_one_text: string;
  cta_button_one_link: string;
  cta_button_two_text: string;
  cta_button_two_link: string;
}

export const fetchHomeCms = async () =>
  parseEnvelope<HomeCms | null>(await apiFetch(HOME_CMS_URL));

// Do not set Content-Type manually: the browser adds the multipart boundary.
export const saveHomeCms = async (formData: FormData) =>
  parseEnvelope<HomeCms>(
    await apiFetch(HOME_CMS_URL, { method: "PUT", body: formData }),
  );
