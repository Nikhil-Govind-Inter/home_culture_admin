import { apiFetch } from "@/lib/apiClient";
import { ApiError, parseEnvelope } from "@/services/auth/authApi";

// Blogs — backed by the home_culture server's `/admin/blogs`.
// Writes use caller-built FormData (the image goes in the `image` field).
const BLOGS_URL = `${import.meta.env.VITE_API_BASE_URL}/blogs`;

export { ApiError };

export type BlogStatus = "draft" | "published";

export interface Blog {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  image?: string | null;
  status: BlogStatus;
  createdAt?: string;
  updatedAt?: string;
}

interface ServerMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const fetchBlogsList = async (page: number, limit: number) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  const response = await apiFetch(`${BLOGS_URL}?${params}`);
  const envelope = await parseEnvelope<Blog[]>(response);
  const meta = envelope.meta as ServerMeta;
  return {
    data: {
      data: envelope.data,
      pagination: {
        totalCount: meta.total,
        totalPages: meta.totalPages,
        currentPage: meta.page,
        limit: meta.limit,
      },
    },
  };
};

export const fetchBlogById = async (id: number) =>
  parseEnvelope<Blog>(await apiFetch(`${BLOGS_URL}/${id}`));

export const createBlog = async (formData: FormData) =>
  parseEnvelope<Blog>(await apiFetch(BLOGS_URL, { method: "POST", body: formData }));

export const updateBlog = async (id: number, formData: FormData) =>
  parseEnvelope<Blog>(await apiFetch(`${BLOGS_URL}/${id}`, { method: "PUT", body: formData }));

export const deleteBlog = async (id: number) =>
  parseEnvelope<{ id: number }>(await apiFetch(`${BLOGS_URL}/${id}`, { method: "DELETE" }));
