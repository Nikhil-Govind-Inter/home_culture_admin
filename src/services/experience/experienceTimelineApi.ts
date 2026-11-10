import { apiFetch } from "@/lib/apiClient";
import { ApiError, parseEnvelope } from "@/services/auth/authApi";

// Experience Timeline — backed by `/experience-timeline` (Bearer-JWT).
// Create/update send multipart FormData. Status and sort order are changed with partial PUTs.
const EXPERIENCE_TIMELINE_URL = `${import.meta.env.VITE_API_BASE_URL}/experience-timeline`;

export { ApiError };

export interface ExperienceTimeline {
  id?: number;
  media_path: string | null;
  media_alt: string;
  title: string;
  subtitle: string;
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
export interface ExperienceTimelineResponse {
  data: {
    data: ExperienceTimeline[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
    };
  };
}

// The server returns `{ data: rows, pagination }`; adapt it to the hook's contract.
export const fetchExperienceTimelineList = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
): Promise<ExperienceTimelineResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) params.set("search", search);

  const response = await apiFetch(`${EXPERIENCE_TIMELINE_URL}?${params}`);
  const envelope = await parseEnvelope<ExperienceTimeline[]>(response);
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

export const fetchExperienceTimelineById = async (
  id: number,
): Promise<{ data: ExperienceTimeline }> => {
  const response = await apiFetch(`${EXPERIENCE_TIMELINE_URL}/${id}`);
  return parseEnvelope<ExperienceTimeline>(response);
};

export const createExperienceTimeline = async (
  formData: FormData,
): Promise<{ data: ExperienceTimeline }> => {
  const response = await apiFetch(EXPERIENCE_TIMELINE_URL, { method: "POST", body: formData });
  return parseEnvelope<ExperienceTimeline>(response);
};

export const updateExperienceTimeline = async (
  id: number,
  formData: FormData,
): Promise<{ data: ExperienceTimeline }> => {
  const response = await apiFetch(`${EXPERIENCE_TIMELINE_URL}/${id}`, {
    method: "PUT",
    body: formData,
  });
  return parseEnvelope<ExperienceTimeline>(response);
};

export const deleteExperienceTimeline = async (id: number): Promise<void> => {
  const response = await apiFetch(`${EXPERIENCE_TIMELINE_URL}/${id}`, { method: "DELETE" });
  await parseEnvelope<{ id: string }>(response);
};

// Partial update used by the list-page switch: only `status` is sent.
export const toggleExperienceTimelineStatus = (item: { id?: number }, isActive: boolean) => {
  const formData = new FormData();
  formData.append("status", String(isActive));
  return updateExperienceTimeline(item.id!, formData);
};

// Partial update used by the list-page stepper: only `sort_order` is sent.
export const updateExperienceTimelineSortOrder = (item: { id?: number }, sortOrder: number) => {
  const formData = new FormData();
  formData.append("sort_order", String(Math.max(1, sortOrder)));
  return updateExperienceTimeline(item.id!, formData);
};
