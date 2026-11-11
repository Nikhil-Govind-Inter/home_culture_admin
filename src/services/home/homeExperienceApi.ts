import { apiFetch } from "@/lib/apiClient";
import { ApiError, parseEnvelope } from "@/services/auth/authApi";

// Home Experiences — backed by `/home-experiences` (Bearer-JWT).
// Create/update send multipart FormData. Status and sort order are changed with partial PUTs.
const HOME_EXPERIENCE_URL = `${import.meta.env.VITE_API_BASE_URL}/home-experiences`;

export { ApiError };

export interface HomeExperience {
  id?: number;
  title: string;
  media_type: "image" | "video";
  media_alt: string;
  media_path: string | null;
  thumbnail: string | null;
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
export interface HomeExperienceResponse {
  data: {
    data: HomeExperience[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
    };
  };
}

// The server returns `{ data: rows, pagination }`; adapt it to the hook's contract.
export const fetchHomeExperienceList = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
): Promise<HomeExperienceResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) params.set("search", search);

  const response = await apiFetch(`${HOME_EXPERIENCE_URL}?${params}`);
  const envelope = await parseEnvelope<HomeExperience[]>(response);
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

export const fetchHomeExperienceById = async (id: number): Promise<{ data: HomeExperience }> => {
  const response = await apiFetch(`${HOME_EXPERIENCE_URL}/${id}`);
  return parseEnvelope<HomeExperience>(response);
};

export const createHomeExperience = async (formData: FormData): Promise<{ data: HomeExperience }> => {
  const response = await apiFetch(HOME_EXPERIENCE_URL, { method: "POST", body: formData });
  return parseEnvelope<HomeExperience>(response);
};

export const updateHomeExperience = async (
  id: number,
  formData: FormData,
): Promise<{ data: HomeExperience }> => {
  const response = await apiFetch(`${HOME_EXPERIENCE_URL}/${id}`, {
    method: "PUT",
    body: formData,
  });
  return parseEnvelope<HomeExperience>(response);
};

export const deleteHomeExperience = async (id: number): Promise<void> => {
  const response = await apiFetch(`${HOME_EXPERIENCE_URL}/${id}`, { method: "DELETE" });
  await parseEnvelope<{ id: string }>(response);
};

// Partial update used by the list-page switch: only `status` is sent.
export const toggleHomeExperienceStatus = (item: { id?: number }, isActive: boolean) => {
  const formData = new FormData();
  formData.append("status", String(isActive));
  return updateHomeExperience(item.id!, formData);
};

// Partial update used by the list-page stepper: only `sort_order` is sent.
export const updateHomeExperienceSortOrder = (item: { id?: number }, sortOrder: number) => {
  const formData = new FormData();
  formData.append("sort_order", String(Math.max(1, sortOrder)));
  return updateHomeExperience(item.id!, formData);
};
