import { apiFetch } from "@/lib/apiClient";
import { ApiError, parseEnvelope } from "@/services/auth/authApi";

// States — backed by the server's `/states` (Bearer-JWT).
// Create/update send JSON. Status and sort order are changed with partial PUTs.
const STATES_URL = `${import.meta.env.VITE_API_BASE_URL}/states`;

export { ApiError };

export interface State {
  name: string;
  slug: string;
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
export interface StateResponse {
  data: {
    data: State[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
    };
  };
}

export const fetchStateList = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
): Promise<StateResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) params.set("search", search);

  const response = await apiFetch(`${STATES_URL}?${params}`);
  const envelope = await parseEnvelope<State[]>(response);
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

// Active records only, unpaginated, for dropdowns.
export const fetchActiveStates = async (): Promise<State[]> => {
  const response = await apiFetch(`${STATES_URL}/active`);
  const envelope = await parseEnvelope<State[]>(response);
  return envelope.data;
};

export const fetchStateBySlug = async (
  slug: string,
): Promise<{ data: State }> => {
  const response = await apiFetch(`${STATES_URL}/${encodeURIComponent(slug)}`);
  return parseEnvelope<State>(response);
};

// Fields the admin can send; partial updates (status / sort order) send only some of them.
export type StatePayload = Partial<
  Omit<State, "createdAt" | "updatedAt" | "deleted_at">
>;

// The body is JSON, so the Content-Type header is required.
const JSON_HEADERS = { "Content-Type": "application/json" };

export const createState = async (
  payload: StatePayload,
): Promise<{ data: State }> => {
  const response = await apiFetch(STATES_URL, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });
  return parseEnvelope<State>(response);
};

export const updateState = async (
  slug: string,
  payload: StatePayload,
): Promise<{ data: State }> => {
  const response = await apiFetch(`${STATES_URL}/${encodeURIComponent(slug)}`, {
    method: "PUT",
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });
  return parseEnvelope<State>(response);
};

export const deleteState = async (slug: string): Promise<void> => {
  const response = await apiFetch(`${STATES_URL}/${encodeURIComponent(slug)}`, {
    method: "DELETE",
  });
  await parseEnvelope<{ slug: string }>(response);
};

// Partial update used by the list-page switch: only `status` is sent.
export const toggleStateStatus = (item: { slug?: string }, isActive: boolean) =>
  updateState(item.slug!, { status: isActive });

// Partial update used by the list-page stepper: only `sort_order` is sent.
export const updateStateSortOrder = (
  item: { slug?: string },
  sortOrder: number,
) => updateState(item.slug!, { sort_order: Math.max(1, sortOrder) });
