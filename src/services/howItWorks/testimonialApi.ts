import { apiFetch } from "@/lib/apiClient";
import { ApiError, parseEnvelope } from "@/services/auth/authApi";

// Testimonials — backed by `/testimonials` (Bearer-JWT).
// Create/update use caller-built FormData (the icon goes in `icon_media_path`). Status and sort order are changed with partial PUTs.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const TESTIMONIALS_URL = `${API_BASE_URL}/testimonials`;

export { ApiError };

export interface Testimonial {
  id?: number;
  media_path: string | null;
  name: string;
  designation: string | null;
  quotes: string;
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
export interface TestimonialResponse {
  data: {
    data: Testimonial[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
    };
  };
}

// The server returns `{ data: rows, meta }`; adapt it to the hook's contract.
export const fetchTestimonialList = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
): Promise<TestimonialResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) params.set("search", search);

  const response = await apiFetch(`${TESTIMONIALS_URL}?${params}`);
  const envelope = await parseEnvelope<Testimonial[]>(response);
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

export const fetchTestimonialById = async (
  id: number,
): Promise<{ data: Testimonial }> => {
  const response = await apiFetch(`${TESTIMONIALS_URL}/${id}`);
  return parseEnvelope<Testimonial>(response);
};

export const createTestimonial = async (
  formData: FormData,
): Promise<{ data: Testimonial }> => {
  const response = await apiFetch(TESTIMONIALS_URL, { method: "POST", body: formData });
  return parseEnvelope<Testimonial>(response);
};

export const updateTestimonial = async (
  id: number,
  formData: FormData,
): Promise<{ data: Testimonial }> => {
  const response = await apiFetch(`${TESTIMONIALS_URL}/${id}`, {
    method: "PUT",
    body: formData,
  });
  return parseEnvelope<Testimonial>(response);
};

export const deleteTestimonial = async (id: number): Promise<void> => {
  const response = await apiFetch(`${TESTIMONIALS_URL}/${id}`, { method: "DELETE" });
  await parseEnvelope<{ id: string }>(response);
};

// Partial update used by the list-page switch: only `status` is sent.
export const toggleTestimonialStatus = (
  item: { id?: number },
  isActive: boolean,
) => {
  const formData = new FormData();
  formData.append("status", String(isActive));
  return updateTestimonial(item.id!, formData);
};

// Partial update used by the list-page stepper: only `sort_order` is sent.
export const updateTestimonialSortOrder = (
  item: { id?: number },
  sortOrder: number,
) => {
  const formData = new FormData();
  formData.append("sort_order", String(Math.max(1, sortOrder)));
  return updateTestimonial(item.id!, formData);
};
