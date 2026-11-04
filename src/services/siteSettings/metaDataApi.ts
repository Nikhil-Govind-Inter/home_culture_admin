import { apiFetch } from "@/lib/apiClient";
import { ApiError, parseEnvelope } from "@/services/auth/authApi";

// Meta data (SEO) — backed by the home_culture server's `/admin/meta-data` (Bearer-JWT).
// Fixed per-page records: list, get by id and update only.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const META_DATA_URL = `${API_BASE_URL}/meta-data`;

export { ApiError };

export interface MetaData {
  id: number;
  page: string;
  page_slug: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  deleted_at?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface MetaDataPayload {
  page: string;
  page_slug: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
}

interface ServerPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Shape consumed by `usePaginatedList` (`{ data: { data, pagination } }`).
export interface MetaDataListResponse {
  data: {
    data: MetaData[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
    };
  };
}

export const fetchMetaDataList = async (
  page: number,
  limit: number,
  search?: string,
): Promise<MetaDataListResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) params.set("search", search);

  const response = await apiFetch(`${META_DATA_URL}?${params}`);
  const envelope = await parseEnvelope<MetaData[]>(response);
  const pagination = envelope.pagination as ServerMeta;

  return {
    data: {
      data: envelope.data,
      pagination: {
        totalCount: pagination.total,
        totalPages: pagination.totalPages,
        currentPage: pagination.page,
        limit: pagination.limit,
      },
    },
  };
};

export const fetchMetaDataById = async (id: number): Promise<{ data: MetaData }> => {
  const response = await apiFetch(`${META_DATA_URL}/${id}`);
  return parseEnvelope<MetaData>(response);
};

export const updateMetaData = async (
  id: number,
  payload: MetaDataPayload,
): Promise<{ data: MetaData }> => {
  const response = await apiFetch(`${META_DATA_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseEnvelope<MetaData>(response);
};
