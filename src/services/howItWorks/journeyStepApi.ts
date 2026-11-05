import { apiFetch } from "@/lib/apiClient";
import { ApiError, parseEnvelope } from "@/services/auth/authApi";

// Journey steps — backed by `/journey-steps` (Bearer-JWT).
// Create/update use caller-built FormData (the icon goes in `icon_media_path`). Status and sort order are changed with partial PUTs.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const JOURNEY_STEPS_URL = `${API_BASE_URL}/journey-steps`;

export { ApiError };

export interface JourneyStep {
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
export interface JourneyStepResponse {
  data: {
    data: JourneyStep[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
    };
  };
}

// The server returns `{ data: rows, meta }`; adapt it to the hook's contract.
export const fetchJourneyStepList = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
): Promise<JourneyStepResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) params.set("search", search);

  const response = await apiFetch(`${JOURNEY_STEPS_URL}?${params}`);
  const envelope = await parseEnvelope<JourneyStep[]>(response);
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

export const fetchJourneyStepById = async (
  id: number,
): Promise<{ data: JourneyStep }> => {
  const response = await apiFetch(`${JOURNEY_STEPS_URL}/${id}`);
  return parseEnvelope<JourneyStep>(response);
};

const jsonRequest = (method: "POST" | "PUT", url: string, body: Partial<JourneyStep>) =>
  apiFetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

export const createJourneyStep = async (
  payload: Partial<JourneyStep>,
): Promise<{ data: JourneyStep }> => {
  const response = await jsonRequest("POST", JOURNEY_STEPS_URL, payload);
  return parseEnvelope<JourneyStep>(response);
};

export const updateJourneyStep = async (
  id: number,
  payload: Partial<JourneyStep>,
): Promise<{ data: JourneyStep }> => {
  const response = await jsonRequest("PUT", `${JOURNEY_STEPS_URL}/${id}`, payload);
  return parseEnvelope<JourneyStep>(response);
};

export const deleteJourneyStep = async (id: number): Promise<void> => {
  const response = await apiFetch(`${JOURNEY_STEPS_URL}/${id}`, { method: "DELETE" });
  await parseEnvelope<{ id: string }>(response);
};

// Partial update used by the list-page switch: only `status` is sent.
export const toggleJourneyStepStatus = (item: { id?: number }, isActive: boolean) =>
  updateJourneyStep(item.id!, { status: isActive });

// Partial update used by the list-page stepper: only `sort_order` is sent.
export const updateJourneyStepSortOrder = (item: { id?: number }, sortOrder: number) =>
  updateJourneyStep(item.id!, { sort_order: Math.max(1, sortOrder) });
