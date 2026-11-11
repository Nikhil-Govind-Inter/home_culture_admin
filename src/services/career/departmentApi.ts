import { apiFetch } from "@/lib/apiClient";
import { ApiError, parseEnvelope } from "@/services/auth/authApi";

// Departments — backed by the server's `/departments` (Bearer-JWT).
// Create/update send JSON. Status and sort order are changed with partial PUTs.
const DEPARTMENTS_URL = `${import.meta.env.VITE_API_BASE_URL}/departments`;

export { ApiError };

export interface Department {
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
export interface DepartmentResponse {
  data: {
    data: Department[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
    };
  };
}

export const fetchDepartmentList = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
): Promise<DepartmentResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) params.set("search", search);

  const response = await apiFetch(`${DEPARTMENTS_URL}?${params}`);
  const envelope = await parseEnvelope<Department[]>(response);
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
export const fetchActiveDepartments = async (): Promise<Department[]> => {
  const response = await apiFetch(`${DEPARTMENTS_URL}/active`);
  const envelope = await parseEnvelope<Department[]>(response);
  return envelope.data;
};

export const fetchDepartmentBySlug = async (
  slug: string,
): Promise<{ data: Department }> => {
  const response = await apiFetch(
    `${DEPARTMENTS_URL}/${encodeURIComponent(slug)}`,
  );
  return parseEnvelope<Department>(response);
};

// Fields the admin can send; partial updates (status / sort order) send only some of them.
export type DepartmentPayload = Partial<
  Omit<Department, "createdAt" | "updatedAt" | "deleted_at">
>;

// The body is JSON, so the Content-Type header is required.
const JSON_HEADERS = { "Content-Type": "application/json" };

export const createDepartment = async (
  payload: DepartmentPayload,
): Promise<{ data: Department }> => {
  const response = await apiFetch(DEPARTMENTS_URL, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });
  return parseEnvelope<Department>(response);
};

export const updateDepartment = async (
  slug: string,
  payload: DepartmentPayload,
): Promise<{ data: Department }> => {
  const response = await apiFetch(
    `${DEPARTMENTS_URL}/${encodeURIComponent(slug)}`,
    {
      method: "PUT",
      headers: JSON_HEADERS,
      body: JSON.stringify(payload),
    },
  );
  return parseEnvelope<Department>(response);
};

export const deleteDepartment = async (slug: string): Promise<void> => {
  const response = await apiFetch(
    `${DEPARTMENTS_URL}/${encodeURIComponent(slug)}`,
    { method: "DELETE" },
  );
  await parseEnvelope<{ slug: string }>(response);
};

// Partial update used by the list-page switch: only `status` is sent.
export const toggleDepartmentStatus = (
  item: { slug?: string },
  isActive: boolean,
) => updateDepartment(item.slug!, { status: isActive });

// Partial update used by the list-page stepper: only `sort_order` is sent.
export const updateDepartmentSortOrder = (
  item: { slug?: string },
  sortOrder: number,
) => updateDepartment(item.slug!, { sort_order: Math.max(1, sortOrder) });
