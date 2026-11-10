import { apiFetch } from "@/lib/apiClient";
import { ApiError, parseEnvelope } from "@/services/auth/authApi";

// Experience FAQs — backed by `/experience-faqs` (Bearer-JWT).
// Create/update send JSON. Status and sort order are changed with partial PUTs.
const EXPERIENCE_FAQS_URL = `${import.meta.env.VITE_API_BASE_URL}/experience-faqs`;

export { ApiError };

export interface ExperienceFaq {
  id?: number;
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
export interface ExperienceFaqResponse {
  data: {
    data: ExperienceFaq[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
    };
  };
}

// The server returns `{ data: rows, pagination }`; adapt it to the hook's contract.
export const fetchExperienceFaqList = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
): Promise<ExperienceFaqResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) params.set("search", search);

  const response = await apiFetch(`${EXPERIENCE_FAQS_URL}?${params}`);
  const envelope = await parseEnvelope<ExperienceFaq[]>(response);
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

export const fetchExperienceFaqById = async (
  id: number,
): Promise<{ data: ExperienceFaq }> => {
  const response = await apiFetch(`${EXPERIENCE_FAQS_URL}/${id}`);
  return parseEnvelope<ExperienceFaq>(response);
};

const jsonRequest = (method: "POST" | "PUT", url: string, body: Partial<ExperienceFaq>) =>
  apiFetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

export const createExperienceFaq = async (
  payload: Partial<ExperienceFaq>,
): Promise<{ data: ExperienceFaq }> => {
  const response = await jsonRequest("POST", EXPERIENCE_FAQS_URL, payload);
  return parseEnvelope<ExperienceFaq>(response);
};

export const updateExperienceFaq = async (
  id: number,
  payload: Partial<ExperienceFaq>,
): Promise<{ data: ExperienceFaq }> => {
  const response = await jsonRequest("PUT", `${EXPERIENCE_FAQS_URL}/${id}`, payload);
  return parseEnvelope<ExperienceFaq>(response);
};

export const deleteExperienceFaq = async (id: number): Promise<void> => {
  const response = await apiFetch(`${EXPERIENCE_FAQS_URL}/${id}`, { method: "DELETE" });
  await parseEnvelope<{ id: string }>(response);
};

// Partial update used by the list-page switch: only `status` is sent.
export const toggleExperienceFaqStatus = (item: { id?: number }, isActive: boolean) =>
  updateExperienceFaq(item.id!, { status: isActive });

// Partial update used by the list-page stepper: only `sort_order` is sent.
export const updateExperienceFaqSortOrder = (item: { id?: number }, sortOrder: number) =>
  updateExperienceFaq(item.id!, { sort_order: Math.max(1, sortOrder) });
