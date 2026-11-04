import { apiFetch } from "@/lib/apiClient";
import { ApiError, parseEnvelope } from "@/services/auth/authApi";

// Social media — backed by the home_culture server's `/admin/social-media` (Bearer-JWT).
// Create/update use caller-built FormData (the icon goes in `icon_media_path`). Status and sort order are changed with partial PUTs.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const SOCIAL_MEDIA_URL = `${API_BASE_URL}/social-media`;

export { ApiError };

export interface SocialMedia {
  id?: number;
  icon_media_path: string | null;
  media_alt: string;
  link: string;
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
export interface SocialMediaResponse {
  data: {
    data: SocialMedia[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
    };
  };
}

// The server returns `{ data: rows, meta }`; adapt it to the hook's contract.
export const fetchSocialMediaList = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
): Promise<SocialMediaResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) params.set("search", search);

  const response = await apiFetch(`${SOCIAL_MEDIA_URL}?${params}`);
  const envelope = await parseEnvelope<SocialMedia[]>(response);
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

export const fetchSocialMediaById = async (
  id: number,
): Promise<{ data: SocialMedia }> => {
  const response = await apiFetch(`${SOCIAL_MEDIA_URL}/${id}`);
  return parseEnvelope<SocialMedia>(response);
};

export const createSocialMedia = async (
  formData: FormData,
): Promise<{ data: SocialMedia }> => {
  const response = await apiFetch(SOCIAL_MEDIA_URL, { method: "POST", body: formData });
  return parseEnvelope<SocialMedia>(response);
};

export const updateSocialMedia = async (
  id: number,
  formData: FormData,
): Promise<{ data: SocialMedia }> => {
  const response = await apiFetch(`${SOCIAL_MEDIA_URL}/${id}`, {
    method: "PUT",
    body: formData,
  });
  return parseEnvelope<SocialMedia>(response);
};

export const deleteSocialMedia = async (id: number): Promise<void> => {
  const response = await apiFetch(`${SOCIAL_MEDIA_URL}/${id}`, { method: "DELETE" });
  await parseEnvelope<{ id: string }>(response);
};

// Partial update used by the list-page switch: only `status` is sent.
export const toggleSocialMediaStatus = (
  item: { id?: number },
  isActive: boolean,
) => {
  const formData = new FormData();
  formData.append("status", String(isActive));
  return updateSocialMedia(item.id!, formData);
};

// Partial update used by the list-page stepper: only `sort_order` is sent.
export const updateSocialMediaSortOrder = (
  item: { id?: number },
  sortOrder: number,
) => {
  const formData = new FormData();
  formData.append("sort_order", String(Math.max(1, sortOrder)));
  return updateSocialMedia(item.id!, formData);
};
