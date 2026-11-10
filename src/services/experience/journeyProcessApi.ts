import { apiFetch } from "@/lib/apiClient";
import { ApiError, parseEnvelope } from "@/services/auth/authApi";

// Journey Processes — backed by `/journey-processes` (Bearer-JWT).
// Create/update send JSON. Status and sort order are changed with partial PUTs.
const JOURNEY_PROCESSES_URL = `${import.meta.env.VITE_API_BASE_URL}/journey-processes`;

export { ApiError };

export interface JourneyProcess {
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
export interface JourneyProcessResponse {
  data: {
    data: JourneyProcess[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
    };
  };
}

// The server returns `{ data: rows, pagination }`; adapt it to the hook's contract.
export const fetchJourneyProcessList = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
): Promise<JourneyProcessResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) params.set("search", search);

  const response = await apiFetch(`${JOURNEY_PROCESSES_URL}?${params}`);
  const envelope = await parseEnvelope<JourneyProcess[]>(response);
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

export const fetchJourneyProcessById = async (
  id: number,
): Promise<{ data: JourneyProcess }> => {
  const response = await apiFetch(`${JOURNEY_PROCESSES_URL}/${id}`);
  return parseEnvelope<JourneyProcess>(response);
};

const jsonRequest = (method: "POST" | "PUT", url: string, body: Partial<JourneyProcess>) =>
  apiFetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

export const createJourneyProcess = async (
  payload: Partial<JourneyProcess>,
): Promise<{ data: JourneyProcess }> => {
  const response = await jsonRequest("POST", JOURNEY_PROCESSES_URL, payload);
  return parseEnvelope<JourneyProcess>(response);
};

export const updateJourneyProcess = async (
  id: number,
  payload: Partial<JourneyProcess>,
): Promise<{ data: JourneyProcess }> => {
  const response = await jsonRequest("PUT", `${JOURNEY_PROCESSES_URL}/${id}`, payload);
  return parseEnvelope<JourneyProcess>(response);
};

export const deleteJourneyProcess = async (id: number): Promise<void> => {
  const response = await apiFetch(`${JOURNEY_PROCESSES_URL}/${id}`, { method: "DELETE" });
  await parseEnvelope<{ id: string }>(response);
};

// Partial update used by the list-page switch: only `status` is sent.
export const toggleJourneyProcessStatus = (item: { id?: number }, isActive: boolean) =>
  updateJourneyProcess(item.id!, { status: isActive });

// Partial update used by the list-page stepper: only `sort_order` is sent.
export const updateJourneyProcessSortOrder = (item: { id?: number }, sortOrder: number) =>
  updateJourneyProcess(item.id!, { sort_order: Math.max(1, sortOrder) });
