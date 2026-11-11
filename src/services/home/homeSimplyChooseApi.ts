import { apiFetch } from "@/lib/apiClient";
import { ApiError, parseEnvelope } from "@/services/auth/authApi";

// Home Simply Choose — backed by `/home-simply-choose` (Bearer-JWT).
// Create/update send JSON. Status and sort order are changed with partial PUTs.
const HOME_SIMPLY_CHOOSE_URL = `${import.meta.env.VITE_API_BASE_URL}/home-simply-choose`;

export { ApiError };

export interface HomeSimplyChoose {
  id?: number;
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
export interface HomeSimplyChooseResponse {
  data: {
    data: HomeSimplyChoose[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
    };
  };
}

// The server returns `{ data: rows, pagination }`; adapt it to the hook's contract.
export const fetchHomeSimplyChooseList = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
): Promise<HomeSimplyChooseResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) params.set("search", search);

  const response = await apiFetch(`${HOME_SIMPLY_CHOOSE_URL}?${params}`);
  const envelope = await parseEnvelope<HomeSimplyChoose[]>(response);
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

export const fetchHomeSimplyChooseById = async (id: number): Promise<{ data: HomeSimplyChoose }> => {
  const response = await apiFetch(`${HOME_SIMPLY_CHOOSE_URL}/${id}`);
  return parseEnvelope<HomeSimplyChoose>(response);
};

const jsonRequest = (method: "POST" | "PUT", url: string, body: Partial<HomeSimplyChoose>) =>
  apiFetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

export const createHomeSimplyChoose = async (payload: Partial<HomeSimplyChoose>): Promise<{ data: HomeSimplyChoose }> => {
  const response = await jsonRequest("POST", HOME_SIMPLY_CHOOSE_URL, payload);
  return parseEnvelope<HomeSimplyChoose>(response);
};

export const updateHomeSimplyChoose = async (
  id: number,
  payload: Partial<HomeSimplyChoose>,
): Promise<{ data: HomeSimplyChoose }> => {
  const response = await jsonRequest("PUT", `${HOME_SIMPLY_CHOOSE_URL}/${id}`, payload);
  return parseEnvelope<HomeSimplyChoose>(response);
};

export const deleteHomeSimplyChoose = async (id: number): Promise<void> => {
  const response = await apiFetch(`${HOME_SIMPLY_CHOOSE_URL}/${id}`, { method: "DELETE" });
  await parseEnvelope<{ id: string }>(response);
};

// Partial update used by the list-page switch: only `status` is sent.
export const toggleHomeSimplyChooseStatus = (item: { id?: number }, isActive: boolean) =>
  updateHomeSimplyChoose(item.id!, { status: isActive });

// Partial update used by the list-page stepper: only `sort_order` is sent.
export const updateHomeSimplyChooseSortOrder = (item: { id?: number }, sortOrder: number) =>
  updateHomeSimplyChoose(item.id!, { sort_order: Math.max(1, sortOrder) });
