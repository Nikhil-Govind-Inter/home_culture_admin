import { apiFetch } from "@/lib/apiClient";
import { ApiError, parseEnvelope } from "@/services/auth/authApi";

// Banners — backed by the home_culture server's `/admin/banners` (Bearer-JWT).
// Writes use caller-built FormData (the image goes in the `image` field).
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BANNERS_URL = `${API_BASE_URL}/banners`;

export { ApiError };

export type BannerStatus = "draft" | "published";

export interface Banner {
  id: number;
  title: string;
  subtitle?: string | null;
  image?: string | null;
  link?: string | null;
  sortOrder?: number;
  status: BannerStatus;
  deleted_at?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface ServerMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Shape consumed by `usePaginatedList` (`{ data: { data, pagination } }`).
export interface BannersListResponse {
  data: {
    data: Banner[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
    };
  };
}

// The server returns `{ data: rows, meta }`; adapt it to the hook's contract.
export const fetchBannersList = async (
  page: number,
  limit: number,
): Promise<BannersListResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  const response = await apiFetch(`${BANNERS_URL}?${params}`);
  const envelope = await parseEnvelope<Banner[]>(response);
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

export const fetchBannerById = async (id: number): Promise<{ data: Banner }> => {
  const response = await apiFetch(`${BANNERS_URL}/${id}`);
  return parseEnvelope<Banner>(response);
};

export const createBanner = async (formData: FormData): Promise<{ data: Banner }> => {
  const response = await apiFetch(BANNERS_URL, { method: "POST", body: formData });
  return parseEnvelope<Banner>(response);
};

export const updateBanner = async (
  id: number,
  formData: FormData,
): Promise<{ data: Banner }> => {
  const response = await apiFetch(`${BANNERS_URL}/${id}`, { method: "PUT", body: formData });
  return parseEnvelope<Banner>(response);
};

export const deleteBanner = async (id: number): Promise<{ data: { id: number } }> => {
  const response = await apiFetch(`${BANNERS_URL}/${id}`, { method: "DELETE" });
  return parseEnvelope<{ id: number }>(response);
};
