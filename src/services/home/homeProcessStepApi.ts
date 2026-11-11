import { apiFetch } from "@/lib/apiClient";
import { ApiError, parseEnvelope } from "@/services/auth/authApi";

// Home Process Steps — backed by `/home-process-steps` (Bearer-JWT).
// Create/update send JSON. Status and sort order are changed with partial PUTs.
const HOME_PROCESS_STEP_URL = `${import.meta.env.VITE_API_BASE_URL}/home-process-steps`;

export { ApiError };

export interface HomeProcessStep {
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
export interface HomeProcessStepResponse {
  data: {
    data: HomeProcessStep[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
    };
  };
}

// The server returns `{ data: rows, pagination }`; adapt it to the hook's contract.
export const fetchHomeProcessStepList = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
): Promise<HomeProcessStepResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) params.set("search", search);

  const response = await apiFetch(`${HOME_PROCESS_STEP_URL}?${params}`);
  const envelope = await parseEnvelope<HomeProcessStep[]>(response);
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

export const fetchHomeProcessStepById = async (id: number): Promise<{ data: HomeProcessStep }> => {
  const response = await apiFetch(`${HOME_PROCESS_STEP_URL}/${id}`);
  return parseEnvelope<HomeProcessStep>(response);
};

const jsonRequest = (method: "POST" | "PUT", url: string, body: Partial<HomeProcessStep>) =>
  apiFetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

export const createHomeProcessStep = async (payload: Partial<HomeProcessStep>): Promise<{ data: HomeProcessStep }> => {
  const response = await jsonRequest("POST", HOME_PROCESS_STEP_URL, payload);
  return parseEnvelope<HomeProcessStep>(response);
};

export const updateHomeProcessStep = async (
  id: number,
  payload: Partial<HomeProcessStep>,
): Promise<{ data: HomeProcessStep }> => {
  const response = await jsonRequest("PUT", `${HOME_PROCESS_STEP_URL}/${id}`, payload);
  return parseEnvelope<HomeProcessStep>(response);
};

export const deleteHomeProcessStep = async (id: number): Promise<void> => {
  const response = await apiFetch(`${HOME_PROCESS_STEP_URL}/${id}`, { method: "DELETE" });
  await parseEnvelope<{ id: string }>(response);
};

// Partial update used by the list-page switch: only `status` is sent.
export const toggleHomeProcessStepStatus = (item: { id?: number }, isActive: boolean) =>
  updateHomeProcessStep(item.id!, { status: isActive });

// Partial update used by the list-page stepper: only `sort_order` is sent.
export const updateHomeProcessStepSortOrder = (item: { id?: number }, sortOrder: number) =>
  updateHomeProcessStep(item.id!, { sort_order: Math.max(1, sortOrder) });
