import { apiFetch } from "@/lib/apiClient";
import { ApiError, parseEnvelope } from "@/services/auth/authApi";

// How It Works CMS — singleton backed by `/how-it-works-cms` (GET + multipart PUT).
// The PUT creates the record on first save (all media files are required then).
const HOW_IT_WORKS_CMS_URL = `${import.meta.env.VITE_API_BASE_URL}/how-it-works-cms`;

export { ApiError };

export interface HowItWorksCms {
  id?: number;

  vision_section_status: boolean;
  vision_section_media_path: string | null;
  vision_section_media_alt: string;
  vision_section_header_title: string;
  vision_section_title: string;
  vision_section_description: string;

  workshop_section_status: boolean;
  workshop_section_media_path: string | null;
  workshop_section_media_alt: string;
  workshop_section_header_title: string;
  workshop_section_title: string;
  workshop_section_description: string;

  artisans_section_status: boolean;
  artisans_section_header_title: string;
  artisans_section_title: string;
  artisans_section_description: string;

  journey_section_status: boolean;
  journey_section_title: string;
  journey_section_media_path: string | null;
  journey_section_media_alt: string;

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

export const fetchHowItWorksCms = async () =>
  parseEnvelope<HowItWorksCms | null>(await apiFetch(HOW_IT_WORKS_CMS_URL));

// Do not set Content-Type manually: the browser adds the multipart boundary.
export const saveHowItWorksCms = async (formData: FormData) =>
  parseEnvelope<HowItWorksCms>(
    await apiFetch(HOW_IT_WORKS_CMS_URL, { method: "PUT", body: formData }),
  );
