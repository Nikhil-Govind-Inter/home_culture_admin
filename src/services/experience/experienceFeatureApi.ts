import { apiFetch } from "@/lib/apiClient";
import { ApiError, parseEnvelope } from "@/services/auth/authApi";

// Experience Features — backed by `/experience-features` (Bearer-JWT).
// Create/update send multipart FormData. Status and sort order are changed with partial PUTs.
const EXPERIENCE_FEATURES_URL = `${import.meta.env.VITE_API_BASE_URL}/experience-features`;

export { ApiError };

export interface ExperienceFeature {
  id?: number;
  media_path: string | null;
  title: string;
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
export interface ExperienceFeatureResponse {
  data: {
    data: ExperienceFeature[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
    };
  };
}

// The server returns `{ data: rows, pagination }`; adapt it to the hook's contract.
export const fetchExperienceFeatureList = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
): Promise<ExperienceFeatureResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) params.set("search", search);

  const response = await apiFetch(`${EXPERIENCE_FEATURES_URL}?${params}`);
  const envelope = await parseEnvelope<ExperienceFeature[]>(response);
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

export const fetchExperienceFeatureById = async (
  id: number,
): Promise<{ data: ExperienceFeature }> => {
  const response = await apiFetch(`${EXPERIENCE_FEATURES_URL}/${id}`);
  return parseEnvelope<ExperienceFeature>(response);
};

export const createExperienceFeature = async (
  formData: FormData,
): Promise<{ data: ExperienceFeature }> => {
  const response = await apiFetch(EXPERIENCE_FEATURES_URL, { method: "POST", body: formData });
  return parseEnvelope<ExperienceFeature>(response);
};

export const updateExperienceFeature = async (
  id: number,
  formData: FormData,
): Promise<{ data: ExperienceFeature }> => {
  const response = await apiFetch(`${EXPERIENCE_FEATURES_URL}/${id}`, {
    method: "PUT",
    body: formData,
  });
  return parseEnvelope<ExperienceFeature>(response);
};

export const deleteExperienceFeature = async (id: number): Promise<void> => {
  const response = await apiFetch(`${EXPERIENCE_FEATURES_URL}/${id}`, { method: "DELETE" });
  await parseEnvelope<{ id: string }>(response);
};

// Partial update used by the list-page switch: only `status` is sent.
export const toggleExperienceFeatureStatus = (item: { id?: number }, isActive: boolean) => {
  const formData = new FormData();
  formData.append("status", String(isActive));
  return updateExperienceFeature(item.id!, formData);
};

// Partial update used by the list-page stepper: only `sort_order` is sent.
export const updateExperienceFeatureSortOrder = (item: { id?: number }, sortOrder: number) => {
  const formData = new FormData();
  formData.append("sort_order", String(Math.max(1, sortOrder)));
  return updateExperienceFeature(item.id!, formData);
};
