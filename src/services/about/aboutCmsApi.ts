import { apiFetch } from "@/lib/apiClient";

// About > CMS — backed by `/api/backend/about/about-cms`. Singleton resource with 3 media
// pairs, so writes go through FormData (like siteSettingsApi.ts/homeMilestonesApi.ts) while
// reads use the envelope-parsing + ApiError convention from homeCmsApi.ts.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ABOUT_CMS_URL = `${API_BASE_URL}/about/about-cms`;

export interface AboutCms {
  id?: number;
  about_title: string;
  about_description: string;
  media_path: string | null;
  media_alt: string | null;
  trust_title: string;
  trust_description: string;
  mission_title: string;
  vision_title: string;
  mission_description: string;
  vision_description: string;
  history_title: string;
  message_title: string;
  message_subtitle: string;
  work_title: string;
  work_media_path: string | null;
  work_media_alt: string | null;
  about_core_title: string;
  about_core_description: string;
  about_code_media_path: string | null;
  about_code_media_alt: string | null;
  features_title: string;
  features_sub_title: string;
  features_description: string;
  industry_title: string;
  industry_description: string;
  industry_media_path: string | null;
  industry_media_alt: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  statusCode?: number;
  timestamp?: string;
  data: T;
}

interface ApiErrorEnvelope {
  success: false;
  error?: {
    message?: string;
    code?: string;
    statusCode?: number;
    details?: unknown;
  };
  message?: string;
}

export class ApiError extends Error {
  code?: string;
  details?: unknown;

  constructor(message: string, code?: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.details = details;
  }
}

const parseEnvelope = async <T>(
  response: Response,
): Promise<ApiEnvelope<T>> => {
  const body = await response
    .json()
    .catch(() => ({}) as ApiEnvelope<T> & ApiErrorEnvelope);
  if (!response.ok || !body.success) {
    const errorBody = body as ApiErrorEnvelope;
    const message =
      errorBody.error?.message ||
      errorBody.message ||
      `Request failed with status ${response.status}`;
    throw new ApiError(
      message,
      errorBody.error?.code,
      errorBody.error?.details,
    );
  }
  return body;
};

// Fetch About CMS data
export const fetchAboutCms = async (): Promise<ApiEnvelope<AboutCms | null>> => {
  const response = await apiFetch(ABOUT_CMS_URL);
  return parseEnvelope<AboutCms | null>(response);
};

// Create or update the About CMS singleton row. `id` defaults to 1, mirroring
// siteSettingsApi.ts's `PUT .../1` — the backend ignores the id and does a findOne().
export const saveAboutCms = async (
  formData: FormData,
  id: number = 1,
): Promise<ApiEnvelope<AboutCms>> => {
  const response = await apiFetch(`${ABOUT_CMS_URL}/${id}`, {
    method: "PUT",
    body: formData,
  });
  return parseEnvelope<AboutCms>(response);
};
