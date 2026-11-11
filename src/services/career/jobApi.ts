import { apiFetch } from "@/lib/apiClient";
import { ApiError, parseEnvelope } from "@/services/auth/authApi";

// Jobs — backed by the server's `/jobs` (Bearer-JWT).
// Create/update send JSON. Status and sort order are changed with partial PUTs.
const JOBS_URL = `${import.meta.env.VITE_API_BASE_URL}/jobs`;

export { ApiError };

export interface Job {
  position: string;
  slug: string;
  posted_at?: string | null;
  city?: {
    name: string;
    slug: string;
    state?: { name: string; slug: string };
  };
  department?: { name: string; slug: string };
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
export interface JobResponse {
  data: {
    data: Job[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
    };
  };
}

export interface JobListFilters {
  state?: string;
  city?: string;
  department?: string;
}

export const fetchJobList = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
  filters?: JobListFilters,
): Promise<JobResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) params.set("search", search);
  if (filters?.state) params.set("state", filters.state);
  if (filters?.city) params.set("city", filters.city);
  if (filters?.department) params.set("department", filters.department);

  const response = await apiFetch(`${JOBS_URL}?${params}`);
  const envelope = await parseEnvelope<Job[]>(response);
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
export const fetchActiveJobs = async (): Promise<Job[]> => {
  const response = await apiFetch(`${JOBS_URL}/active`);
  const envelope = await parseEnvelope<Job[]>(response);
  return envelope.data;
};

export const fetchJobBySlug = async (slug: string): Promise<{ data: Job }> => {
  const response = await apiFetch(`${JOBS_URL}/${encodeURIComponent(slug)}`);
  return parseEnvelope<Job>(response);
};

// Fields the admin can send; partial updates (status / sort order) send only some of them.
export type JobPayload = Partial<
  Omit<Job, "createdAt" | "updatedAt" | "deleted_at" | "city" | "department">
> & {
  // Slugs of the selected city and department.
  city?: string;
  department?: string;
};

// The body is JSON, so the Content-Type header is required.
const JSON_HEADERS = { "Content-Type": "application/json" };

export const createJob = async (
  payload: JobPayload,
): Promise<{ data: Job }> => {
  const response = await apiFetch(JOBS_URL, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });
  return parseEnvelope<Job>(response);
};

export const updateJob = async (
  slug: string,
  payload: JobPayload,
): Promise<{ data: Job }> => {
  const response = await apiFetch(`${JOBS_URL}/${encodeURIComponent(slug)}`, {
    method: "PUT",
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });
  return parseEnvelope<Job>(response);
};

export const deleteJob = async (slug: string): Promise<void> => {
  const response = await apiFetch(`${JOBS_URL}/${encodeURIComponent(slug)}`, {
    method: "DELETE",
  });
  await parseEnvelope<{ slug: string }>(response);
};

// Partial update used by the list-page switch: only `status` is sent.
export const toggleJobStatus = (item: { slug?: string }, isActive: boolean) =>
  updateJob(item.slug!, { status: isActive });

// Partial update used by the list-page stepper: only `sort_order` is sent.
export const updateJobSortOrder = (
  item: { slug?: string },
  sortOrder: number,
) => updateJob(item.slug!, { sort_order: Math.max(1, sortOrder) });
