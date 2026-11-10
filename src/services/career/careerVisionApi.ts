import { apiFetch } from "@/lib/apiClient";
import { ApiError, parseEnvelope } from "@/services/auth/authApi";

// Career Visions — backed by `/career-visions` (Bearer-JWT).
// Create/update send JSON. Status and sort order are changed with partial PUTs.
const CAREER_VISIONS_URL = `${import.meta.env.VITE_API_BASE_URL}/career-visions`;

export { ApiError };

export interface CareerVision {
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
export interface CareerVisionResponse {
  data: {
    data: CareerVision[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
    };
  };
}

// The server returns `{ data: rows, pagination }`; adapt it to the hook's contract.
export const fetchCareerVisionList = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
): Promise<CareerVisionResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) params.set("search", search);

  const response = await apiFetch(`${CAREER_VISIONS_URL}?${params}`);
  const envelope = await parseEnvelope<CareerVision[]>(response);
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

export const fetchCareerVisionById = async (
  id: number,
): Promise<{ data: CareerVision }> => {
  const response = await apiFetch(`${CAREER_VISIONS_URL}/${id}`);
  return parseEnvelope<CareerVision>(response);
};

const jsonRequest = (method: "POST" | "PUT", url: string, body: Partial<CareerVision>) =>
  apiFetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

export const createCareerVision = async (
  payload: Partial<CareerVision>,
): Promise<{ data: CareerVision }> => {
  const response = await jsonRequest("POST", CAREER_VISIONS_URL, payload);
  return parseEnvelope<CareerVision>(response);
};

export const updateCareerVision = async (
  id: number,
  payload: Partial<CareerVision>,
): Promise<{ data: CareerVision }> => {
  const response = await jsonRequest("PUT", `${CAREER_VISIONS_URL}/${id}`, payload);
  return parseEnvelope<CareerVision>(response);
};

export const deleteCareerVision = async (id: number): Promise<void> => {
  const response = await apiFetch(`${CAREER_VISIONS_URL}/${id}`, { method: "DELETE" });
  await parseEnvelope<{ id: string }>(response);
};

// Partial update used by the list-page switch: only `status` is sent.
export const toggleCareerVisionStatus = (item: { id?: number }, isActive: boolean) =>
  updateCareerVision(item.id!, { status: isActive });

// Partial update used by the list-page stepper: only `sort_order` is sent.
export const updateCareerVisionSortOrder = (item: { id?: number }, sortOrder: number) =>
  updateCareerVision(item.id!, { sort_order: Math.max(1, sortOrder) });
