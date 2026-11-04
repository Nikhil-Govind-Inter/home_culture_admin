import { apiFetch } from "@/lib/apiClient";
import { ApiError, parseEnvelope } from "@/services/auth/authApi";

// Pages — backed by the home_culture server's `/admin/pages` (JSON body).
const PAGES_URL = `${import.meta.env.VITE_API_BASE_URL}/pages`;

export { ApiError };

export type PageStatus = "draft" | "published";

export interface Page {
  id: number;
  title: string;
  slug: string;
  content?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  status: PageStatus;
  createdAt?: string;
  updatedAt?: string;
}

export type PagePayload = Omit<Page, "id" | "createdAt" | "updatedAt">;

interface ServerMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const fetchPagesList = async (page: number, limit: number) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  const response = await apiFetch(`${PAGES_URL}?${params}`);
  const envelope = await parseEnvelope<Page[]>(response);
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

export const fetchPageById = async (id: number) =>
  parseEnvelope<Page>(await apiFetch(`${PAGES_URL}/${id}`));

const jsonInit = (method: string, payload: unknown): RequestInit => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});

export const createPage = async (payload: PagePayload) =>
  parseEnvelope<Page>(await apiFetch(PAGES_URL, jsonInit("POST", payload)));

export const updatePage = async (id: number, payload: PagePayload) =>
  parseEnvelope<Page>(await apiFetch(`${PAGES_URL}/${id}`, jsonInit("PUT", payload)));

export const deletePage = async (id: number) =>
  parseEnvelope<{ id: number }>(await apiFetch(`${PAGES_URL}/${id}`, { method: "DELETE" }));
