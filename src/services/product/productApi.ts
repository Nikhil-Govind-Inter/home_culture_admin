import { apiFetch } from "@/lib/apiClient";
import { ApiError, parseEnvelope } from "@/services/auth/authApi";

// Products — backed by `/products` (Bearer-JWT).
// Create/update send multipart FormData. Status and sort order are changed with partial PUTs.
// Styles, trims, sizes and add-ons are many-to-many: sent as repeated `style_slugs` / `trim_slugs` /
// `size_slugs` / `add_ons_slugs` fields (an empty value clears the selection; omitting leaves it untouched).
const PRODUCT_URL = `${import.meta.env.VITE_API_BASE_URL}/products`;

export { ApiError };

// Slim records the server includes with each product.
export interface ProductRelation {
  id: number | string;
  slug?: string;
  title?: string;
  subtitle?: string;
  size?: number | string;
}

export interface ProductListFilters {
  style_slug?: string;
  trim_slug?: string;
  size_slug?: string;
  add_ons_slug?: string;
}

export interface Product {
  id?: number;
  media_path: string | null;
  media_alt: string;
  icon_media_path: string | null;
  icon_media_alt: string | null;
  slug?: string;
  title: string;
  excerpt?: string;
  header_title: string;
  description: string;
  button_text: string;
  styles?: ProductRelation[];
  trims?: ProductRelation[];
  sizes?: ProductRelation[];
  add_ons?: ProductRelation[];
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
export interface ProductResponse {
  data: {
    data: Product[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
    };
  };
}

// The server returns `{ data: rows, pagination }`; adapt it to the hook's contract.
export const fetchProductList = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
  filters?: ProductListFilters,
): Promise<ProductResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) params.set("search", search);
  Object.entries(filters ?? {}).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });

  const response = await apiFetch(`${PRODUCT_URL}?${params}`);
  const envelope = await parseEnvelope<Product[]>(response);
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

export const fetchProductById = async (id: number): Promise<{ data: Product }> => {
  const response = await apiFetch(`${PRODUCT_URL}/${id}`);
  return parseEnvelope<Product>(response);
};

export const createProduct = async (formData: FormData): Promise<{ data: Product }> => {
  const response = await apiFetch(PRODUCT_URL, { method: "POST", body: formData });
  return parseEnvelope<Product>(response);
};

export const updateProduct = async (id: number, formData: FormData): Promise<{ data: Product }> => {
  const response = await apiFetch(`${PRODUCT_URL}/${id}`, { method: "PUT", body: formData });
  return parseEnvelope<Product>(response);
};

export const deleteProduct = async (id: number): Promise<void> => {
  const response = await apiFetch(`${PRODUCT_URL}/${id}`, { method: "DELETE" });
  await parseEnvelope<{ id: string }>(response);
};

// Partial update used by the list-page switch: only `status` is sent.
export const toggleProductStatus = (item: { id?: number }, isActive: boolean) => {
  const formData = new FormData();
  formData.append("status", String(isActive));
  return updateProduct(item.id!, formData);
};

// Partial update used by the list-page stepper: only `sort_order` is sent.
export const updateProductSortOrder = (item: { id?: number }, sortOrder: number) => {
  const formData = new FormData();
  formData.append("sort_order", String(Math.max(1, sortOrder)));
  return updateProduct(item.id!, formData);
};
