import { apiFetch } from "@/lib/apiClient";
import { ApiError, parseEnvelope } from "@/services/auth/authApi";

// Home Banners — backed by `/home-banners` (Bearer-JWT).
// Create/update send multipart FormData. Status and sort order are changed with partial PUTs.
const HOME_BANNER_URL = `${import.meta.env.VITE_API_BASE_URL}/home-banners`;

export { ApiError };

export interface HomeBanner {
  id?: number;
  header_title: string;
  title: string;
  description: string;
  media_type: "image" | "video";
  media_alt: string;
  desktop_media_path: string | null;
  mobile_media_path: string | null;
  thumbnail: string | null;
  button_one_text: string;
  button_one_link: string;
  button_two_text: string;
  button_two_link: string;
  sort_order?: number;
  status?: boolean;
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
export interface HomeBannerResponse {
  data: {
    data: HomeBanner[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
    };
  };
}

// The server returns `{ data: rows, pagination }`; adapt it to the hook's contract.
export const fetchHomeBannerList = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
): Promise<HomeBannerResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) params.set("search", search);

  const response = await apiFetch(`${HOME_BANNER_URL}?${params}`);
  const envelope = await parseEnvelope<HomeBanner[]>(response);
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

export const fetchHomeBannerById = async (id: number): Promise<{ data: HomeBanner }> => {
  const response = await apiFetch(`${HOME_BANNER_URL}/${id}`);
  return parseEnvelope<HomeBanner>(response);
};

export const createHomeBanner = async (formData: FormData): Promise<{ data: HomeBanner }> => {
  const response = await apiFetch(HOME_BANNER_URL, { method: "POST", body: formData });
  return parseEnvelope<HomeBanner>(response);
};

export const updateHomeBanner = async (
  id: number,
  formData: FormData,
): Promise<{ data: HomeBanner }> => {
  const response = await apiFetch(`${HOME_BANNER_URL}/${id}`, {
    method: "PUT",
    body: formData,
  });
  return parseEnvelope<HomeBanner>(response);
};

export const deleteHomeBanner = async (id: number): Promise<void> => {
  const response = await apiFetch(`${HOME_BANNER_URL}/${id}`, { method: "DELETE" });
  await parseEnvelope<{ id: string }>(response);
};

// Partial update used by the list-page switch: only `status` is sent.
export const toggleHomeBannerStatus = (item: { id?: number }, isActive: boolean) => {
  const formData = new FormData();
  formData.append("status", String(isActive));
  return updateHomeBanner(item.id!, formData);
};

// Partial update used by the list-page stepper: only `sort_order` is sent.
export const updateHomeBannerSortOrder = (item: { id?: number }, sortOrder: number) => {
  const formData = new FormData();
  formData.append("sort_order", String(Math.max(1, sortOrder)));
  return updateHomeBanner(item.id!, formData);
};
