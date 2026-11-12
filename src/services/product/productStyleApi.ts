import { apiFetch } from "@/lib/apiClient";
import { ApiError, parseEnvelope } from "@/services/auth/authApi";

// Product Style — backed by `/product-styles` (Bearer-JWT).
// Create/update send multipart FormData. Status and sort order are changed with partial PUTs.
const PRODUCTSTYLE_URL = `${import.meta.env.VITE_API_BASE_URL}/product-styles`;

export { ApiError };

export interface ProductStyle {
  id?: number;
  media_path: string | null;
  media_alt: string;
  slug?: string;
  title: string;
  description: string;
  button_text: string;
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
export interface ProductStyleResponse {
  data: {
    data: ProductStyle[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
    };
  };
}

// The server returns `{ data: rows, pagination }`; adapt it to the hook's contract.
export const fetchProductStyleList = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
): Promise<ProductStyleResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) params.set("search", search);

  const response = await apiFetch(`${PRODUCTSTYLE_URL}?${params}`);
  const envelope = await parseEnvelope<ProductStyle[]>(response);
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
export const fetchActiveProductStyles = async (): Promise<ProductStyle[]> => {
  const response = await apiFetch(`${PRODUCTSTYLE_URL}/active`);
  const envelope = await parseEnvelope<ProductStyle[]>(response);
  return envelope.data;
};

export const fetchProductStyleById = async (id: number): Promise<{ data: ProductStyle }> => {
  const response = await apiFetch(`${PRODUCTSTYLE_URL}/${id}`);
  return parseEnvelope<ProductStyle>(response);
};

export const createProductStyle = async (formData: FormData): Promise<{ data: ProductStyle }> => {
  const response = await apiFetch(PRODUCTSTYLE_URL, { method: "POST", body: formData });
  return parseEnvelope<ProductStyle>(response);
};

export const updateProductStyle = async (id: number, formData: FormData): Promise<{ data: ProductStyle }> => {
  const response = await apiFetch(`${PRODUCTSTYLE_URL}/${id}`, { method: "PUT", body: formData });
  return parseEnvelope<ProductStyle>(response);
};

export const deleteProductStyle = async (id: number): Promise<void> => {
  const response = await apiFetch(`${PRODUCTSTYLE_URL}/${id}`, { method: "DELETE" });
  await parseEnvelope<{ id: string }>(response);
};

// Partial update used by the list-page switch: only `status` is sent.
export const toggleProductStyleStatus = (item: { id?: number }, isActive: boolean) => {
  const formData = new FormData();
  formData.append("status", String(isActive));
  return updateProductStyle(item.id!, formData);
};

// Partial update used by the list-page stepper: only `sort_order` is sent.
export const updateProductStyleSortOrder = (item: { id?: number }, sortOrder: number) => {
  const formData = new FormData();
  formData.append("sort_order", String(Math.max(1, sortOrder)));
  return updateProductStyle(item.id!, formData);
};
