import { apiFetch } from "@/lib/apiClient";
import { ApiError, parseEnvelope } from "@/services/auth/authApi";

// About highlights — backed by the server's `/about-highlights` (Bearer-JWT).
// Create/update use caller-built FormData (the icon goes in `icon_media_path`). Status and sort order are changed with partial PUTs.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ABOUT_HIGHLIGHT_URL = `${API_BASE_URL}/about-highlights`;

export { ApiError };

export interface AboutHighlight {
  id?: number;
  icon_media_path: string | null;
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
export interface AboutHighlightResponse {
  data: {
    data: AboutHighlight[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
    };
  };
}

// The server returns `{ data: rows, meta }`; adapt it to the hook's contract.
export const fetchAboutHighlightList = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
): Promise<AboutHighlightResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) params.set("search", search);

  const response = await apiFetch(`${ABOUT_HIGHLIGHT_URL}?${params}`);
  const envelope = await parseEnvelope<AboutHighlight[]>(response);
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

export const fetchAboutHighlightById = async (
  id: number,
): Promise<{ data: AboutHighlight }> => {
  const response = await apiFetch(`${ABOUT_HIGHLIGHT_URL}/${id}`);
  return parseEnvelope<AboutHighlight>(response);
};

export const createAboutHighlight = async (
  formData: FormData,
): Promise<{ data: AboutHighlight }> => {
  const response = await apiFetch(ABOUT_HIGHLIGHT_URL, { method: "POST", body: formData });
  return parseEnvelope<AboutHighlight>(response);
};

export const updateAboutHighlight = async (
  id: number,
  formData: FormData,
): Promise<{ data: AboutHighlight }> => {
  const response = await apiFetch(`${ABOUT_HIGHLIGHT_URL}/${id}`, {
    method: "PUT",
    body: formData,
  });
  return parseEnvelope<AboutHighlight>(response);
};

export const deleteAboutHighlight = async (id: number): Promise<void> => {
  const response = await apiFetch(`${ABOUT_HIGHLIGHT_URL}/${id}`, { method: "DELETE" });
  await parseEnvelope<{ id: string }>(response);
};

// Partial update used by the list-page switch: only `status` is sent.
export const toggleAboutHighlightStatus = (
  item: { id?: number },
  isActive: boolean,
) => {
  const formData = new FormData();
  formData.append("status", String(isActive));
  return updateAboutHighlight(item.id!, formData);
};

// Partial update used by the list-page stepper: only `sort_order` is sent.
export const updateAboutHighlightSortOrder = (
  item: { id?: number },
  sortOrder: number,
) => {
  const formData = new FormData();
  formData.append("sort_order", String(Math.max(1, sortOrder)));
  return updateAboutHighlight(item.id!, formData);
};
