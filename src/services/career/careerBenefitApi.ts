import { apiFetch } from "@/lib/apiClient";
import { ApiError, parseEnvelope } from "@/services/auth/authApi";

// Career Benefits — backed by `/career-benefits` (Bearer-JWT).
// Create/update send multipart FormData. Status and sort order are changed with partial PUTs.
const CAREER_BENEFITS_URL = `${import.meta.env.VITE_API_BASE_URL}/career-benefits`;

export { ApiError };

export interface CareerBenefit {
  id?: number;
  media_path: string | null;
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
export interface CareerBenefitResponse {
  data: {
    data: CareerBenefit[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
    };
  };
}

// The server returns `{ data: rows, pagination }`; adapt it to the hook's contract.
export const fetchCareerBenefitList = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
): Promise<CareerBenefitResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) params.set("search", search);

  const response = await apiFetch(`${CAREER_BENEFITS_URL}?${params}`);
  const envelope = await parseEnvelope<CareerBenefit[]>(response);
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

export const fetchCareerBenefitById = async (
  id: number,
): Promise<{ data: CareerBenefit }> => {
  const response = await apiFetch(`${CAREER_BENEFITS_URL}/${id}`);
  return parseEnvelope<CareerBenefit>(response);
};

export const createCareerBenefit = async (
  formData: FormData,
): Promise<{ data: CareerBenefit }> => {
  const response = await apiFetch(CAREER_BENEFITS_URL, {
    method: "POST",
    body: formData,
  });
  return parseEnvelope<CareerBenefit>(response);
};

export const updateCareerBenefit = async (
  id: number,
  formData: FormData,
): Promise<{ data: CareerBenefit }> => {
  const response = await apiFetch(`${CAREER_BENEFITS_URL}/${id}`, {
    method: "PUT",
    body: formData,
  });
  return parseEnvelope<CareerBenefit>(response);
};

export const deleteCareerBenefit = async (id: number): Promise<void> => {
  const response = await apiFetch(`${CAREER_BENEFITS_URL}/${id}`, {
    method: "DELETE",
  });
  await parseEnvelope<{ id: string }>(response);
};

// Partial update used by the list-page switch: only `status` is sent.
export const toggleCareerBenefitStatus = (
  item: { id?: number },
  isActive: boolean,
) => {
  const formData = new FormData();
  formData.append("status", String(isActive));
  return updateCareerBenefit(item.id!, formData);
};

// Partial update used by the list-page stepper: only `sort_order` is sent.
export const updateCareerBenefitSortOrder = (
  item: { id?: number },
  sortOrder: number,
) => {
  const formData = new FormData();
  formData.append("sort_order", String(Math.max(1, sortOrder)));
  return updateCareerBenefit(item.id!, formData);
};
