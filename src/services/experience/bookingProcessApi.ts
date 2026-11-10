import { apiFetch } from "@/lib/apiClient";
import { ApiError, parseEnvelope } from "@/services/auth/authApi";

// Booking Processes — backed by `/booking-processes` (Bearer-JWT).
// Create/update send JSON. Status and sort order are changed with partial PUTs.
const BOOKING_PROCESSES_URL = `${import.meta.env.VITE_API_BASE_URL}/booking-processes`;

export { ApiError };

export interface BookingProcess {
  id?: number;
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
export interface BookingProcessResponse {
  data: {
    data: BookingProcess[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
    };
  };
}

// The server returns `{ data: rows, pagination }`; adapt it to the hook's contract.
export const fetchBookingProcessList = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
): Promise<BookingProcessResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) params.set("search", search);

  const response = await apiFetch(`${BOOKING_PROCESSES_URL}?${params}`);
  const envelope = await parseEnvelope<BookingProcess[]>(response);
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

export const fetchBookingProcessById = async (
  id: number,
): Promise<{ data: BookingProcess }> => {
  const response = await apiFetch(`${BOOKING_PROCESSES_URL}/${id}`);
  return parseEnvelope<BookingProcess>(response);
};

const jsonRequest = (method: "POST" | "PUT", url: string, body: Partial<BookingProcess>) =>
  apiFetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

export const createBookingProcess = async (
  payload: Partial<BookingProcess>,
): Promise<{ data: BookingProcess }> => {
  const response = await jsonRequest("POST", BOOKING_PROCESSES_URL, payload);
  return parseEnvelope<BookingProcess>(response);
};

export const updateBookingProcess = async (
  id: number,
  payload: Partial<BookingProcess>,
): Promise<{ data: BookingProcess }> => {
  const response = await jsonRequest("PUT", `${BOOKING_PROCESSES_URL}/${id}`, payload);
  return parseEnvelope<BookingProcess>(response);
};

export const deleteBookingProcess = async (id: number): Promise<void> => {
  const response = await apiFetch(`${BOOKING_PROCESSES_URL}/${id}`, { method: "DELETE" });
  await parseEnvelope<{ id: string }>(response);
};

// Partial update used by the list-page switch: only `status` is sent.
export const toggleBookingProcessStatus = (item: { id?: number }, isActive: boolean) =>
  updateBookingProcess(item.id!, { status: isActive });

// Partial update used by the list-page stepper: only `sort_order` is sent.
export const updateBookingProcessSortOrder = (item: { id?: number }, sortOrder: number) =>
  updateBookingProcess(item.id!, { sort_order: Math.max(1, sortOrder) });
