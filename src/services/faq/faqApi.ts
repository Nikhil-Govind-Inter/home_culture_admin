import { apiFetch } from "@/lib/apiClient";
import { ApiError, parseEnvelope } from "@/services/auth/authApi";

// FAQs — backed by the server's `/faqs` (Bearer-JWT).
// Status and sort order are changed with partial PUTs.
const FAQ_URL = `${import.meta.env.VITE_API_BASE_URL}/faqs`;

export { ApiError };

export interface Faq {
  id?: number;
  category_id?: number;
  category?: { id: number; title: string } | null;
  question: string;
  answer: string;
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
export interface FaqResponse {
  data: {
    data: Faq[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
    };
  };
}

// The server returns `{ data: rows, pagination }`; adapt it to the hook's contract.
export interface FaqListFilters {
  category_id?: string;
}

export const fetchFaqList = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
  filters?: FaqListFilters,
): Promise<FaqResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) params.set("search", search);
  if (filters?.category_id) params.set("category_id", filters.category_id);

  const response = await apiFetch(`${FAQ_URL}?${params}`);
  const envelope = await parseEnvelope<Faq[]>(response);
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

export const fetchFaqById = async (id: number): Promise<{ data: Faq }> => {
  const response = await apiFetch(`${FAQ_URL}/${id}`);
  return parseEnvelope<Faq>(response);
};

// Fields the admin can send; partial updates (status / sort order) send only some of them.
type FaqPayload = Partial<
  Pick<Faq, "category_id" | "question" | "answer" | "sort_order" | "status">
>;

// The body is JSON, so the Content-Type header is required: the server does not parse
// multipart bodies on this route, and without the header fetch sends `text/plain`.
const JSON_HEADERS = { "Content-Type": "application/json" };

export const createFaq = async (payload: FaqPayload): Promise<{ data: Faq }> => {
  const response = await apiFetch(FAQ_URL, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });
  return parseEnvelope<Faq>(response);
};

export const updateFaq = async (
  id: number,
  payload: FaqPayload,
): Promise<{ data: Faq }> => {
  const response = await apiFetch(`${FAQ_URL}/${id}`, {
    method: "PUT",
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });
  return parseEnvelope<Faq>(response);
};

export const deleteFaq = async (id: number): Promise<void> => {
  const response = await apiFetch(`${FAQ_URL}/${id}`, { method: "DELETE" });
  await parseEnvelope<{ id: string }>(response);
};

// Partial update used by the list-page switch: only `status` is sent.
export const toggleFaqStatus = (item: { id?: number }, isActive: boolean) =>
  updateFaq(item.id!, { status: isActive });

// Partial update used by the list-page stepper: only `sort_order` is sent.
export const updateFaqSortOrder = (item: { id?: number }, sortOrder: number) =>
  updateFaq(item.id!, { sort_order: Math.max(1, sortOrder) });
