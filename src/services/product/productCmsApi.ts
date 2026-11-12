import { apiFetch } from "@/lib/apiClient";
import { ApiError, parseEnvelope } from "@/services/auth/authApi";

// Product CMS — singleton backed by `/product-cms` (GET + multipart PUT).
// The PUT creates the record on first save (all three images are required then).
const PRODUCT_CMS_URL = `${import.meta.env.VITE_API_BASE_URL}/product-cms`;

export { ApiError };

export interface ProductCms {
  id?: number;
  product_section_title: string;
  style_section_title: string;
  trim_section_title: string;
  size_section_title: string;
  add_ons_section_title: string;
  summary_section_title: string;
  summary_section_media_alt: string;
  summary_section_media_header_title: string;
  summary_section_media_title: string;
  cta_section_media_alt: string;
  cta_section_header_title: string;
  cta_section_title: string;
  cta_section_button_text: string;
  cta_section_button_link: string;
  product_section_description: string;
  style_section_description: string;
  trim_section_description: string;
  size_section_description: string;
  add_ons_section_description: string;
  summary_section_description: string;
  cta_section_description: string;
  cta_section_status: boolean;
  summary_section_media_path: string | null;
  cta_section_desktop_media_path: string | null;
  cta_section_mobile_media_path: string | null;
}

// The server answers 404 until the first save: treat that as "no content yet".
export const fetchProductCms = async (): Promise<{ data: ProductCms | null }> => {
  const response = await apiFetch(PRODUCT_CMS_URL);
  if (response.status === 404) return { data: null };
  return parseEnvelope<ProductCms>(response);
};

// Do not set Content-Type manually: the browser adds the multipart boundary.
export const saveProductCms = async (formData: FormData) =>
  parseEnvelope<ProductCms>(
    await apiFetch(PRODUCT_CMS_URL, { method: "PUT", body: formData }),
  );
