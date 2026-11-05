import { apiFetch } from "@/lib/apiClient";
import { ApiError, parseEnvelope } from "@/services/auth/authApi";

// Workshop materials — backed by `/workshop-materials` (Bearer-JWT).
// Create/update use caller-built FormData (the icon goes in `icon_media_path`). Status and sort order are changed with partial PUTs.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const WORKSHOP_MATERIALS_URL = `${API_BASE_URL}/workshop-materials`;

export { ApiError };

export interface WorkshopMaterial {
  id?: number;
  media_path: string | null;
  title: string;
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
export interface WorkshopMaterialResponse {
  data: {
    data: WorkshopMaterial[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
    };
  };
}

// The server returns `{ data: rows, meta }`; adapt it to the hook's contract.
export const fetchWorkshopMaterialList = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
): Promise<WorkshopMaterialResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) params.set("search", search);

  const response = await apiFetch(`${WORKSHOP_MATERIALS_URL}?${params}`);
  const envelope = await parseEnvelope<WorkshopMaterial[]>(response);
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

export const fetchWorkshopMaterialById = async (
  id: number,
): Promise<{ data: WorkshopMaterial }> => {
  const response = await apiFetch(`${WORKSHOP_MATERIALS_URL}/${id}`);
  return parseEnvelope<WorkshopMaterial>(response);
};

export const createWorkshopMaterial = async (
  formData: FormData,
): Promise<{ data: WorkshopMaterial }> => {
  const response = await apiFetch(WORKSHOP_MATERIALS_URL, { method: "POST", body: formData });
  return parseEnvelope<WorkshopMaterial>(response);
};

export const updateWorkshopMaterial = async (
  id: number,
  formData: FormData,
): Promise<{ data: WorkshopMaterial }> => {
  const response = await apiFetch(`${WORKSHOP_MATERIALS_URL}/${id}`, {
    method: "PUT",
    body: formData,
  });
  return parseEnvelope<WorkshopMaterial>(response);
};

export const deleteWorkshopMaterial = async (id: number): Promise<void> => {
  const response = await apiFetch(`${WORKSHOP_MATERIALS_URL}/${id}`, { method: "DELETE" });
  await parseEnvelope<{ id: string }>(response);
};

// Partial update used by the list-page switch: only `status` is sent.
export const toggleWorkshopMaterialStatus = (
  item: { id?: number },
  isActive: boolean,
) => {
  const formData = new FormData();
  formData.append("status", String(isActive));
  return updateWorkshopMaterial(item.id!, formData);
};

// Partial update used by the list-page stepper: only `sort_order` is sent.
export const updateWorkshopMaterialSortOrder = (
  item: { id?: number },
  sortOrder: number,
) => {
  const formData = new FormData();
  formData.append("sort_order", String(Math.max(1, sortOrder)));
  return updateWorkshopMaterial(item.id!, formData);
};
