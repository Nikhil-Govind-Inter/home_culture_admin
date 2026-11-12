import { apiFetch } from "@/lib/apiClient";
import { ApiError, parseEnvelope } from "@/services/auth/authApi";

// Product Size — backed by `/product-sizes` (Bearer-JWT).
// Create/update send multipart FormData. Status and sort order are changed with partial PUTs.
const PRODUCTSIZE_URL = `${import.meta.env.VITE_API_BASE_URL}/product-sizes`;

export { ApiError };

export interface ProductSize {
  id?: number;
  media_path: string | null;
  media_alt: string;
  slug?: string;
  title: string;
  size: string | number;
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
export interface ProductSizeResponse {
  data: {
    data: ProductSize[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
    };
  };
}

// The server returns `{ data: rows, pagination }`; adapt it to the hook's contract.
export const fetchProductSizeList = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
): Promise<ProductSizeResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) params.set("search", search);

  const response = await apiFetch(`${PRODUCTSIZE_URL}?${params}`);
  const envelope = await parseEnvelope<ProductSize[]>(response);
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

// Active records only, for dropdowns (product form).
export const fetchActiveProductSizes = async (): Promise<ProductSize[]> => {
  const response = await apiFetch(`${PRODUCTSIZE_URL}/active`);
  const envelope = await parseEnvelope<ProductSize[]>(response);
  return envelope.data;
};

export const fetchProductSizeById = async (id: number): Promise<{ data: ProductSize }> => {
  const response = await apiFetch(`${PRODUCTSIZE_URL}/${id}`);
  return parseEnvelope<ProductSize>(response);
};

export const createProductSize = async (formData: FormData): Promise<{ data: ProductSize }> => {
  const response = await apiFetch(PRODUCTSIZE_URL, { method: "POST", body: formData });
  return parseEnvelope<ProductSize>(response);
};

export const updateProductSize = async (id: number, formData: FormData): Promise<{ data: ProductSize }> => {
  const response = await apiFetch(`${PRODUCTSIZE_URL}/${id}`, { method: "PUT", body: formData });
  return parseEnvelope<ProductSize>(response);
};

export const deleteProductSize = async (id: number): Promise<void> => {
  const response = await apiFetch(`${PRODUCTSIZE_URL}/${id}`, { method: "DELETE" });
  await parseEnvelope<{ id: string }>(response);
};

// Partial update used by the list-page switch: only `status` is sent.
export const toggleProductSizeStatus = (item: { id?: number }, isActive: boolean) => {
  const formData = new FormData();
  formData.append("status", String(isActive));
  return updateProductSize(item.id!, formData);
};

// Partial update used by the list-page stepper: only `sort_order` is sent.
export const updateProductSizeSortOrder = (item: { id?: number }, sortOrder: number) => {
  const formData = new FormData();
  formData.append("sort_order", String(Math.max(1, sortOrder)));
  return updateProductSize(item.id!, formData);
};
