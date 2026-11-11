import { apiFetch } from "@/lib/apiClient";
import { ApiError, parseEnvelope } from "@/services/auth/authApi";

// Citys — backed by the server's `/cities` (Bearer-JWT).
// Create/update send JSON. Status and sort order are changed with partial PUTs.
const CITIES_URL = `${import.meta.env.VITE_API_BASE_URL}/cities`;

export { ApiError };

export interface City {
  name: string;
  slug: string;
  state?: { name: string; slug: string };
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
export interface CityResponse {
  data: {
    data: City[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
    };
  };
}

export interface CityListFilters {
  state?: string;
}

export const fetchCityList = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
  filters?: CityListFilters,
): Promise<CityResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) params.set("search", search);
  if (filters?.state) params.set("state", filters.state);

  const response = await apiFetch(`${CITIES_URL}?${params}`);
  const envelope = await parseEnvelope<City[]>(response);
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
// `stateSlug` limits the cities to one state.
export const fetchActiveCities = async (
  stateSlug?: string,
): Promise<City[]> => {
  const query = stateSlug ? `?state=${encodeURIComponent(stateSlug)}` : "";
  const response = await apiFetch(`${CITIES_URL}/active${query}`);
  const envelope = await parseEnvelope<City[]>(response);
  return envelope.data;
};

export const fetchCityBySlug = async (
  slug: string,
): Promise<{ data: City }> => {
  const response = await apiFetch(`${CITIES_URL}/${encodeURIComponent(slug)}`);
  return parseEnvelope<City>(response);
};

// Fields the admin can send; partial updates (status / sort order) send only some of them.
export type CityPayload = Partial<
  Omit<City, "createdAt" | "updatedAt" | "deleted_at" | "state">
> & {
  // Slug of the selected state.
  state?: string;
};

// The body is JSON, so the Content-Type header is required.
const JSON_HEADERS = { "Content-Type": "application/json" };

export const createCity = async (
  payload: CityPayload,
): Promise<{ data: City }> => {
  const response = await apiFetch(CITIES_URL, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });
  return parseEnvelope<City>(response);
};

export const updateCity = async (
  slug: string,
  payload: CityPayload,
): Promise<{ data: City }> => {
  const response = await apiFetch(`${CITIES_URL}/${encodeURIComponent(slug)}`, {
    method: "PUT",
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });
  return parseEnvelope<City>(response);
};

export const deleteCity = async (slug: string): Promise<void> => {
  const response = await apiFetch(`${CITIES_URL}/${encodeURIComponent(slug)}`, {
    method: "DELETE",
  });
  await parseEnvelope<{ slug: string }>(response);
};

// Partial update used by the list-page switch: only `status` is sent.
export const toggleCityStatus = (item: { slug?: string }, isActive: boolean) =>
  updateCity(item.slug!, { status: isActive });

// Partial update used by the list-page stepper: only `sort_order` is sent.
export const updateCitySortOrder = (
  item: { slug?: string },
  sortOrder: number,
) => updateCity(item.slug!, { sort_order: Math.max(1, sortOrder) });
