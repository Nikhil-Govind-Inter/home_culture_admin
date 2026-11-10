import { apiFetch } from "@/lib/apiClient";
import { ApiError, parseEnvelope } from "@/services/auth/authApi";

// Blog categories — backed by the server's `/blog-categories` (Bearer-JWT).
// Status and sort order are changed with partial PUTs.
const BLOG_CATEGORY_URL = `${import.meta.env.VITE_API_BASE_URL}/blog-categories`;

export { ApiError };

export interface BlogCategory {
  id?: number;
  title: string;
  slug?: string;
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
export interface BlogCategoryResponse {
  data: {
    data: BlogCategory[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
    };
  };
}

export const fetchBlogCategoryList = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
): Promise<BlogCategoryResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) params.set("search", search);

  const response = await apiFetch(`${BLOG_CATEGORY_URL}?${params}`);
  const envelope = await parseEnvelope<BlogCategory[]>(response);
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

// All categories for dropdowns (the server caps a page at 100).
export const fetchAllBlogCategories = async (): Promise<BlogCategory[]> => {
  const response = await apiFetch(`${BLOG_CATEGORY_URL}?page=1&limit=100`);
  const envelope = await parseEnvelope<BlogCategory[]>(response);
  return envelope.data;
};

export const fetchBlogCategoryById = async (
  id: number,
): Promise<{ data: BlogCategory }> => {
  const response = await apiFetch(`${BLOG_CATEGORY_URL}/${id}`);
  return parseEnvelope<BlogCategory>(response);
};

// Fields the admin can send; partial updates (status / sort order) send only some of them.
type BlogCategoryPayload = Partial<
  Omit<BlogCategory, "id" | "createdAt" | "updatedAt" | "deleted_at">
>;

// The body is JSON, so the Content-Type header is required: without it fetch sends
// `text/plain` and the server's JSON parser leaves `req.body` empty.
const JSON_HEADERS = { "Content-Type": "application/json" };

export const createBlogCategory = async (
  payload: BlogCategoryPayload,
): Promise<{ data: BlogCategory }> => {
  const response = await apiFetch(BLOG_CATEGORY_URL, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });
  return parseEnvelope<BlogCategory>(response);
};

export const updateBlogCategory = async (
  id: number,
  payload: BlogCategoryPayload,
): Promise<{ data: BlogCategory }> => {
  const response = await apiFetch(`${BLOG_CATEGORY_URL}/${id}`, {
    method: "PUT",
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });
  return parseEnvelope<BlogCategory>(response);
};

export const deleteBlogCategory = async (id: number): Promise<void> => {
  const response = await apiFetch(`${BLOG_CATEGORY_URL}/${id}`, { method: "DELETE" });
  await parseEnvelope<{ id: string }>(response);
};

// Partial update used by the list-page switch: only `status` is sent.
export const toggleBlogCategoryStatus = (item: { id?: number }, isActive: boolean) => {
  const payload = {
    status: isActive,
  };
  return updateBlogCategory(item.id!, payload);
};

// Partial update used by the list-page stepper: only `sort_order` is sent.
export const updateBlogCategorySortOrder = (item: { id?: number }, sortOrder: number) => {
  const payload = {
    sort_order: Math.max(1, sortOrder),
  };
  return updateBlogCategory(item.id!, payload);
};



export const fetchActiveBlogCategories = async (): Promise<BlogCategory[]> => {
  const response = await apiFetch(`${BLOG_CATEGORY_URL}/active`);
  const envelope = await parseEnvelope<BlogCategory[]>(response);
  return envelope.data;
};