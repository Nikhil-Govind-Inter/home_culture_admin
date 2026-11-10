import { apiFetch } from "@/lib/apiClient";
import { ApiError, parseEnvelope } from "@/services/auth/authApi";

// Blogs — backed by the server's `/blogs` (Bearer-JWT).
// Create/update send multipart FormData (thumbnail_media_path + media_path files).
// Status and sort order are changed with partial PUTs.
const BLOGS_URL = `${import.meta.env.VITE_API_BASE_URL}/blogs`;

export { ApiError };

export interface Blog {
  id?: number;
  category_id: number;
  category?: { id: number; title: string } | null;
  title: string;
  slug: string;
  excerpt: string;
  description: string;
  reading_time: number;
  thumbnail_media_path: string | null;
  thumbnail_media_alt: string;
  media_path: string | null;
  media_alt: string;
  sort_order?: number;
  status?: boolean;
  is_featured?: boolean;
  show_in_home?: boolean;
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
export interface BlogResponse {
  data: {
    data: Blog[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
    };
  };
}

export interface BlogListFilters {
  category_id?: string;
}

export const fetchBlogsList = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
  filters?: BlogListFilters,
): Promise<BlogResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) params.set("search", search);
  if (filters?.category_id) params.set("category_id", filters.category_id);

  const response = await apiFetch(`${BLOGS_URL}?${params}`);
  const envelope = await parseEnvelope<Blog[]>(response);
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

export const fetchBlogById = async (id: number): Promise<{ data: Blog }> =>
  parseEnvelope<Blog>(await apiFetch(`${BLOGS_URL}/${id}`));

// Do not set Content-Type manually: the browser adds the multipart boundary.
export const createBlog = async (formData: FormData): Promise<{ data: Blog }> =>
  parseEnvelope<Blog>(await apiFetch(BLOGS_URL, { method: "POST", body: formData }));

export const updateBlog = async (
  id: number,
  formData: FormData,
): Promise<{ data: Blog }> =>
  parseEnvelope<Blog>(
    await apiFetch(`${BLOGS_URL}/${id}`, { method: "PUT", body: formData }),
  );

export const deleteBlog = async (id: number): Promise<void> => {
  await parseEnvelope<{ id: string }>(
    await apiFetch(`${BLOGS_URL}/${id}`, { method: "DELETE" }),
  );
};

// Partial update used by the list-page switch: only `status` is sent.
export const toggleBlogStatus = (item: { id?: number }, isActive: boolean) => {
  const formData = new FormData();
  formData.append("status", String(isActive));
  return updateBlog(item.id!, formData);
};

// Partial update used by the list-page switch: only `is_featured` is sent.
export const toggleBlogFeatured = (item: { id?: number }, isFeatured: boolean) => {
  const formData = new FormData();
  formData.append("is_featured", String(isFeatured));
  return updateBlog(item.id!, formData);
};

// Partial update used by the list-page switch: only `show_in_home` is sent.
export const toggleBlogShowInHome = (item: { id?: number }, showInHome: boolean) => {
  const formData = new FormData();
  formData.append("show_in_home", String(showInHome));
  return updateBlog(item.id!, formData);
};

// Partial update used by the list-page stepper: only `sort_order` is sent.
export const updateBlogSortOrder = (item: { id?: number }, sortOrder: number) => {
  const formData = new FormData();
  formData.append("sort_order", String(Math.max(1, sortOrder)));
  return updateBlog(item.id!, formData);
};
