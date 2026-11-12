import { apiFetch } from "@/lib/apiClient";
import { ApiError, parseEnvelope } from "@/services/auth/authApi";

// Product Add-on — backed by `/product-add-ons` (Bearer-JWT).
// Create/update send multipart FormData. Status and sort order are changed with partial PUTs.
const PRODUCTADDON_URL = `${import.meta.env.VITE_API_BASE_URL}/product-add-ons`;

export { ApiError };

export interface ProductAddOn {
  id?: number;
  media_path: string | null;
  media_alt: string;
  slug?: string;
  title: string;
  subtitle: string;
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
export interface ProductAddOnResponse {
  data: {
    data: ProductAddOn[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
    };
  };
}

// The server returns `{ data: rows, pagination }`; adapt it to the hook's contract.
export const fetchProductAddOnList = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
): Promise<ProductAddOnResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) params.set("search", search);

  const response = await apiFetch(`${PRODUCTADDON_URL}?${params}`);
  const envelope = await parseEnvelope<ProductAddOn[]>(response);
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
export const fetchActiveProductAddOns = async (): Promise<ProductAddOn[]> => {
  const response = await apiFetch(`${PRODUCTADDON_URL}/active`);
  const envelope = await parseEnvelope<ProductAddOn[]>(response);
  return envelope.data;
};

export const fetchProductAddOnById = async (id: number): Promise<{ data: ProductAddOn }> => {
  const response = await apiFetch(`${PRODUCTADDON_URL}/${id}`);
  return parseEnvelope<ProductAddOn>(response);
};

export const createProductAddOn = async (formData: FormData): Promise<{ data: ProductAddOn }> => {
  const response = await apiFetch(PRODUCTADDON_URL, { method: "POST", body: formData });
  return parseEnvelope<ProductAddOn>(response);
};

export const updateProductAddOn = async (id: number, formData: FormData): Promise<{ data: ProductAddOn }> => {
  const response = await apiFetch(`${PRODUCTADDON_URL}/${id}`, { method: "PUT", body: formData });
  return parseEnvelope<ProductAddOn>(response);
};

export const deleteProductAddOn = async (id: number): Promise<void> => {
  const response = await apiFetch(`${PRODUCTADDON_URL}/${id}`, { method: "DELETE" });
  await parseEnvelope<{ id: string }>(response);
};

// Partial update used by the list-page switch: only `status` is sent.
export const toggleProductAddOnStatus = (item: { id?: number }, isActive: boolean) => {
  const formData = new FormData();
  formData.append("status", String(isActive));
  return updateProductAddOn(item.id!, formData);
};

// Partial update used by the list-page stepper: only `sort_order` is sent.
export const updateProductAddOnSortOrder = (item: { id?: number }, sortOrder: number) => {
  const formData = new FormData();
  formData.append("sort_order", String(Math.max(1, sortOrder)));
  return updateProductAddOn(item.id!, formData);
};
