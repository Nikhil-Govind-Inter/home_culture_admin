import { apiFetch } from "@/lib/apiClient";
import { ApiError, parseEnvelope } from "@/services/auth/authApi";

// Home Highlights — backed by `/home-highlights` (Bearer-JWT).
// Create/update send multipart FormData. Status and sort order are changed with partial PUTs.
const HOME_HIGHLIGHT_URL = `${import.meta.env.VITE_API_BASE_URL}/home-highlights`;

export { ApiError };

export interface HomeHighlight {
  id?: number;
  media_path: string | null;
  media_alt: string;
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
export interface HomeHighlightResponse {
  data: {
    data: HomeHighlight[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
    };
  };
}

// The server returns `{ data: rows, pagination }`; adapt it to the hook's contract.
export const fetchHomeHighlightList = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
): Promise<HomeHighlightResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) params.set("search", search);

  const response = await apiFetch(`${HOME_HIGHLIGHT_URL}?${params}`);
  const envelope = await parseEnvelope<HomeHighlight[]>(response);
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

export const fetchHomeHighlightById = async (id: number): Promise<{ data: HomeHighlight }> => {
  const response = await apiFetch(`${HOME_HIGHLIGHT_URL}/${id}`);
  return parseEnvelope<HomeHighlight>(response);
};

export const createHomeHighlight = async (formData: FormData): Promise<{ data: HomeHighlight }> => {
  const response = await apiFetch(HOME_HIGHLIGHT_URL, { method: "POST", body: formData });
  return parseEnvelope<HomeHighlight>(response);
};

export const updateHomeHighlight = async (
  id: number,
  formData: FormData,
): Promise<{ data: HomeHighlight }> => {
  const response = await apiFetch(`${HOME_HIGHLIGHT_URL}/${id}`, {
    method: "PUT",
    body: formData,
  });
  return parseEnvelope<HomeHighlight>(response);
};

export const deleteHomeHighlight = async (id: number): Promise<void> => {
  const response = await apiFetch(`${HOME_HIGHLIGHT_URL}/${id}`, { method: "DELETE" });
  await parseEnvelope<{ id: string }>(response);
};

// Partial update used by the list-page switch: only `status` is sent.
export const toggleHomeHighlightStatus = (item: { id?: number }, isActive: boolean) => {
  const formData = new FormData();
  formData.append("status", String(isActive));
  return updateHomeHighlight(item.id!, formData);
};

// Partial update used by the list-page stepper: only `sort_order` is sent.
export const updateHomeHighlightSortOrder = (item: { id?: number }, sortOrder: number) => {
  const formData = new FormData();
  formData.append("sort_order", String(Math.max(1, sortOrder)));
  return updateHomeHighlight(item.id!, formData);
};
