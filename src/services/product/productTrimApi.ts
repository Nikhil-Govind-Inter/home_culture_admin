import { apiFetch } from "@/lib/apiClient";
import { ApiError, parseEnvelope } from "@/services/auth/authApi";

// Product Trim — backed by `/product-trims` (Bearer-JWT).
// Create/update send multipart FormData. Status and sort order are changed with partial PUTs.
const PRODUCTTRIM_URL = `${import.meta.env.VITE_API_BASE_URL}/product-trims`;

export { ApiError };

export interface ProductTrim {
  id?: number;
  media_path: string | null;
  slug?: string;
  title: string;
  description: string;
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
export interface ProductTrimResponse {
  data: {
    data: ProductTrim[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
    };
  };
}

// The server returns `{ data: rows, pagination }`; adapt it to the hook's contract.
export const fetchProductTrimList = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
): Promise<ProductTrimResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) params.set("search", search);

  const response = await apiFetch(`${PRODUCTTRIM_URL}?${params}`);
  const envelope = await parseEnvelope<ProductTrim[]>(response);
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
export const fetchActiveProductTrims = async (): Promise<ProductTrim[]> => {
  const response = await apiFetch(`${PRODUCTTRIM_URL}/active`);
  const envelope = await parseEnvelope<ProductTrim[]>(response);
  return envelope.data;
};

export const fetchProductTrimById = async (id: number): Promise<{ data: ProductTrim }> => {
  const response = await apiFetch(`${PRODUCTTRIM_URL}/${id}`);
  return parseEnvelope<ProductTrim>(response);
};

export const createProductTrim = async (formData: FormData): Promise<{ data: ProductTrim }> => {
  const response = await apiFetch(PRODUCTTRIM_URL, { method: "POST", body: formData });
  return parseEnvelope<ProductTrim>(response);
};

export const updateProductTrim = async (id: number, formData: FormData): Promise<{ data: ProductTrim }> => {
  const response = await apiFetch(`${PRODUCTTRIM_URL}/${id}`, { method: "PUT", body: formData });
  return parseEnvelope<ProductTrim>(response);
};

export const deleteProductTrim = async (id: number): Promise<void> => {
  const response = await apiFetch(`${PRODUCTTRIM_URL}/${id}`, { method: "DELETE" });
  await parseEnvelope<{ id: string }>(response);
};

// Partial update used by the list-page switch: only `status` is sent.
export const toggleProductTrimStatus = (item: { id?: number }, isActive: boolean) => {
  const formData = new FormData();
  formData.append("status", String(isActive));
  return updateProductTrim(item.id!, formData);
};

// Partial update used by the list-page stepper: only `sort_order` is sent.
export const updateProductTrimSortOrder = (item: { id?: number }, sortOrder: number) => {
  const formData = new FormData();
  formData.append("sort_order", String(Math.max(1, sortOrder)));
  return updateProductTrim(item.id!, formData);
};
