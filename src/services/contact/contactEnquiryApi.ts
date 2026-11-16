import { apiFetch } from "@/lib/apiClient";
import { ApiError, parseEnvelope } from "@/services/auth/authApi";

// Contact enquiries — backed by the server's `/contact-enquiries` (Bearer-JWT).
// Read-only: list and get by id. Rows are created by the public contact form.
const CONTACT_ENQUIRIES_URL = `${import.meta.env.VITE_API_BASE_URL}/contact-enquiries`;

export { ApiError };

export interface ContactEnquiry {
  id: number | string;
  full_name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  createdAt: string;
  updatedAt?: string;
}

interface ServerPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Shape consumed by `usePaginatedList` (`{ data: { data, pagination } }`).
export interface ContactEnquiryResponse {
  data: {
    data: ContactEnquiry[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
    };
  };
}

export const fetchContactEnquiryList = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
): Promise<ContactEnquiryResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) params.set("search", search);

  const response = await apiFetch(`${CONTACT_ENQUIRIES_URL}?${params}`);
  const envelope = await parseEnvelope<ContactEnquiry[]>(response);
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

export const fetchContactEnquiryById = async (
  id: string | number,
): Promise<{ data: ContactEnquiry }> => {
  const response = await apiFetch(
    `${CONTACT_ENQUIRIES_URL}/${encodeURIComponent(String(id))}`,
  );
  return parseEnvelope<ContactEnquiry>(response);
};
