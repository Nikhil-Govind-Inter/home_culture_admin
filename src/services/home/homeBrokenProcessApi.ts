import { apiFetch } from "@/lib/apiClient";
import { ApiError, parseEnvelope } from "@/services/auth/authApi";

// Home Broken Process — backed by `/home-broken-processes` (Bearer-JWT).
// Create/update send multipart FormData. Status and sort order are changed with partial PUTs.
const HOME_BROKEN_PROCESS_URL = `${import.meta.env.VITE_API_BASE_URL}/home-broken-processes`;

export { ApiError };

export interface HomeBrokenProcess {
  id?: number;
  title: string;
  media_type: "image" | "video";
  media_alt: string;
  desktop_media_path: string | null;
  mobile_media_path: string | null;
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
export interface HomeBrokenProcessResponse {
  data: {
    data: HomeBrokenProcess[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
    };
  };
}

// The server returns `{ data: rows, pagination }`; adapt it to the hook's contract.
export const fetchHomeBrokenProcessList = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
): Promise<HomeBrokenProcessResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) params.set("search", search);

  const response = await apiFetch(`${HOME_BROKEN_PROCESS_URL}?${params}`);
  const envelope = await parseEnvelope<HomeBrokenProcess[]>(response);
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

export const fetchHomeBrokenProcessById = async (id: number): Promise<{ data: HomeBrokenProcess }> => {
  const response = await apiFetch(`${HOME_BROKEN_PROCESS_URL}/${id}`);
  return parseEnvelope<HomeBrokenProcess>(response);
};

export const createHomeBrokenProcess = async (formData: FormData): Promise<{ data: HomeBrokenProcess }> => {
  const response = await apiFetch(HOME_BROKEN_PROCESS_URL, { method: "POST", body: formData });
  return parseEnvelope<HomeBrokenProcess>(response);
};

export const updateHomeBrokenProcess = async (
  id: number,
  formData: FormData,
): Promise<{ data: HomeBrokenProcess }> => {
  const response = await apiFetch(`${HOME_BROKEN_PROCESS_URL}/${id}`, {
    method: "PUT",
    body: formData,
  });
  return parseEnvelope<HomeBrokenProcess>(response);
};

export const deleteHomeBrokenProcess = async (id: number): Promise<void> => {
  const response = await apiFetch(`${HOME_BROKEN_PROCESS_URL}/${id}`, { method: "DELETE" });
  await parseEnvelope<{ id: string }>(response);
};

// Partial update used by the list-page switch: only `status` is sent.
export const toggleHomeBrokenProcessStatus = (item: { id?: number }, isActive: boolean) => {
  const formData = new FormData();
  formData.append("status", String(isActive));
  return updateHomeBrokenProcess(item.id!, formData);
};

// Partial update used by the list-page stepper: only `sort_order` is sent.
export const updateHomeBrokenProcessSortOrder = (item: { id?: number }, sortOrder: number) => {
  const formData = new FormData();
  formData.append("sort_order", String(Math.max(1, sortOrder)));
  return updateHomeBrokenProcess(item.id!, formData);
};
