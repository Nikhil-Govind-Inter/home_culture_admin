import { apiFetch } from "@/lib/apiClient";
import { ApiError, parseEnvelope } from "@/services/auth/authApi";

// Banners — backed by the home_culture server's `/admin/banners` (Bearer-JWT).
// Banners are fixed per-page records: list, get by id and update only.
// Updates use caller-built FormData (media goes in `banner_desktop_media_path`, plus
// `banner_mobile_media_path` for images or `banner_thumbnail_media_path` for video).
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BANNERS_URL = `${API_BASE_URL}/banners`;

export { ApiError };

export interface Banner {
  id: number;
  page: string;
  page_slug: string;
  header_title: string;
  title: string;
  description: string;
  status: boolean;
  media_type: "image" | "video";
  banner_thumbnail_media_path?: string | null;
  banner_desktop_media_path?: string | null;
  banner_mobile_media_path?: string | null;
  banner_media_alt: string;
  deleted_at?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface ServerPagination {
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
  search?: string,
): Promise<BannersListResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) params.set("search", search);

  const response = await apiFetch(`${BANNERS_URL}?${params}`);
  const envelope = await parseEnvelope<Banner[]>(response);
  const meta = envelope.pagination as ServerPagination;

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

export const updateBanner = async (
  id: number,
  formData: FormData,
): Promise<{ data: Banner }> => {
  const response = await apiFetch(`${BANNERS_URL}/${id}`, { method: "PUT", body: formData });
  return parseEnvelope<Banner>(response);
};

// Partial update used by the list-page switch: only `status` is sent.
export const toggleBannerStatus = async (
  banner: Banner,
  isActive: boolean,
): Promise<{ data: Banner }> => {
  const formData = new FormData();
  formData.append("status", String(isActive));
  return updateBanner(banner.id, formData);
};
