import { apiFetch } from "@/lib/apiClient";
import { ApiError, parseEnvelope } from "@/services/auth/authApi";

// Locations — backed by `/locations` (Bearer-JWT).
// Create/update send JSON. Status and sort order are changed with partial PUTs.
const LOCATIONS_URL = `${import.meta.env.VITE_API_BASE_URL}/locations`;

export { ApiError };

export interface Location {
  id?: number;
  location: string;
  location_link: string;
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
export interface LocationResponse {
  data: {
    data: Location[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
    };
  };
}

// The server returns `{ data: rows, pagination }`; adapt it to the hook's contract.
export const fetchLocationList = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
): Promise<LocationResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) params.set("search", search);

  const response = await apiFetch(`${LOCATIONS_URL}?${params}`);
  const envelope = await parseEnvelope<Location[]>(response);
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

export const fetchLocationById = async (
  id: number,
): Promise<{ data: Location }> => {
  const response = await apiFetch(`${LOCATIONS_URL}/${id}`);
  return parseEnvelope<Location>(response);
};

const jsonRequest = (method: "POST" | "PUT", url: string, body: Partial<Location>) =>
  apiFetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

export const createLocation = async (
  payload: Partial<Location>,
): Promise<{ data: Location }> => {
  const response = await jsonRequest("POST", LOCATIONS_URL, payload);
  return parseEnvelope<Location>(response);
};

export const updateLocation = async (
  id: number,
  payload: Partial<Location>,
): Promise<{ data: Location }> => {
  const response = await jsonRequest("PUT", `${LOCATIONS_URL}/${id}`, payload);
  return parseEnvelope<Location>(response);
};

export const deleteLocation = async (id: number): Promise<void> => {
  const response = await apiFetch(`${LOCATIONS_URL}/${id}`, { method: "DELETE" });
  await parseEnvelope<{ id: string }>(response);
};

// Partial update used by the list-page switch: only `status` is sent.
export const toggleLocationStatus = (item: { id?: number }, isActive: boolean) =>
  updateLocation(item.id!, { status: isActive });

// Partial update used by the list-page stepper: only `sort_order` is sent.
export const updateLocationSortOrder = (item: { id?: number }, sortOrder: number) =>
  updateLocation(item.id!, { sort_order: Math.max(1, sortOrder) });
