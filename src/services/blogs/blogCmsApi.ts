import { apiFetch } from "@/lib/apiClient";
import { ApiError, parseEnvelope } from "@/services/auth/authApi";

// Blog CMS — singleton backed by `/blog-cms` (GET + multipart PUT).
// The PUT creates the record on first save (both CTA images are required then).
const BLOG_CMS_URL = `${import.meta.env.VITE_API_BASE_URL}/blog-cms`;

export { ApiError };

export interface BlogCms {
  id?: number;

  detail_page_status: boolean;
  detail_page_header_title: string;
  detail_page_title: string;
  detail_page_button_text: string;
  detail_page_button_link: string;

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

export const fetchBlogCms = async () =>
  parseEnvelope<BlogCms | null>(await apiFetch(BLOG_CMS_URL));

// Do not set Content-Type manually: the browser adds the multipart boundary.
export const saveBlogCms = async (formData: FormData) =>
  parseEnvelope<BlogCms>(
    await apiFetch(BLOG_CMS_URL, { method: "PUT", body: formData }),
  );
