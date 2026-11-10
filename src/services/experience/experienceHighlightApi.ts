import { apiFetch } from "@/lib/apiClient";
import { ApiError, parseEnvelope } from "@/services/auth/authApi";

// Experience Highlights — backed by `/experience-highlights` (Bearer-JWT).
// Create/update send JSON. Status and sort order are changed with partial PUTs.
const EXPERIENCE_HIGHLIGHTS_URL = `${import.meta.env.VITE_API_BASE_URL}/experience-highlights`;

export { ApiError };

export interface ExperienceHighlight {
  id?: number;
  title: string;
  description: string;
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
export interface ExperienceHighlightResponse {
  data: {
    data: ExperienceHighlight[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
    };
  };
}

// The server returns `{ data: rows, pagination }`; adapt it to the hook's contract.
export const fetchExperienceHighlightList = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
): Promise<ExperienceHighlightResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) params.set("search", search);

  const response = await apiFetch(`${EXPERIENCE_HIGHLIGHTS_URL}?${params}`);
  const envelope = await parseEnvelope<ExperienceHighlight[]>(response);
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

export const fetchExperienceHighlightById = async (
  id: number,
): Promise<{ data: ExperienceHighlight }> => {
  const response = await apiFetch(`${EXPERIENCE_HIGHLIGHTS_URL}/${id}`);
  return parseEnvelope<ExperienceHighlight>(response);
};

const jsonRequest = (method: "POST" | "PUT", url: string, body: Partial<ExperienceHighlight>) =>
  apiFetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

export const createExperienceHighlight = async (
  payload: Partial<ExperienceHighlight>,
): Promise<{ data: ExperienceHighlight }> => {
  const response = await jsonRequest("POST", EXPERIENCE_HIGHLIGHTS_URL, payload);
  return parseEnvelope<ExperienceHighlight>(response);
};

export const updateExperienceHighlight = async (
  id: number,
  payload: Partial<ExperienceHighlight>,
): Promise<{ data: ExperienceHighlight }> => {
  const response = await jsonRequest("PUT", `${EXPERIENCE_HIGHLIGHTS_URL}/${id}`, payload);
  return parseEnvelope<ExperienceHighlight>(response);
};

export const deleteExperienceHighlight = async (id: number): Promise<void> => {
  const response = await apiFetch(`${EXPERIENCE_HIGHLIGHTS_URL}/${id}`, { method: "DELETE" });
  await parseEnvelope<{ id: string }>(response);
};

// Partial update used by the list-page switch: only `status` is sent.
export const toggleExperienceHighlightStatus = (item: { id?: number }, isActive: boolean) =>
  updateExperienceHighlight(item.id!, { status: isActive });

// Partial update used by the list-page stepper: only `sort_order` is sent.
export const updateExperienceHighlightSortOrder = (item: { id?: number }, sortOrder: number) =>
  updateExperienceHighlight(item.id!, { sort_order: Math.max(1, sortOrder) });
