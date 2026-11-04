// Standardized API utilities for forms
import { getToken } from "@/lib/authSession";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Get authentication token
export const getAuthToken = (): string => {
  return getToken() || "";
};

// Check if data contains file uploads
export const hasFileUploads = (data: Record<string, any>): boolean => {
  return Object.values(data).some(value => value instanceof File);
};

// Create FormData with proper handling
export const createFormData = (data: Record<string, any>): FormData => {
  const formData = new FormData();
  
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (value instanceof File) {
        formData.append(key, value);
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (typeof item === 'object') {
            formData.append(`${key}[${index}]`, JSON.stringify(item));
          } else {
            formData.append(`${key}[${index}]`, item.toString());
          }
        });
      } else if (typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value.toString());
      }
    }
  });
  
  return formData;
};

// Standardized API call function
export const apiCall = async (
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    data?: Record<string, any>;
    params?: Record<string, string | number>;
  } = {}
): Promise<any> => {
  const { method = 'GET', data, params } = options;
  const token = getAuthToken();
  
  // Build URL with query parameters
  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, value.toString());
    });
    url += `?${searchParams.toString()}`;
  }
  
  // Prepare headers
  const headers: HeadersInit = {
    'Authorization': `Bearer ${token}`,
  };
  
  let body: BodyInit | undefined;
  
  // Handle request body based on data type
  if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
    if (hasFileUploads(data)) {
      // For file uploads, use FormData and DON'T set Content-Type
      // Browser will automatically set multipart/form-data with boundary
      body = createFormData(data);
    } else {
      // For JSON data, set Content-Type and stringify
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(data);
    }
  }
  
  const response = await fetch(url, {
    method,
    headers,
    body,
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
};

// Specialized functions for common operations
export const createItem = (endpoint: string) => (data: Record<string, any>) => 
  apiCall(endpoint, { method: 'POST', data });

export const updateItem = (endpoint: string) => (id: string | number, data: Record<string, any>) => 
  apiCall(`${endpoint}/${id}`, { method: 'PUT', data });

export const deleteItem = (endpoint: string) => (id: string | number) => 
  apiCall(`${endpoint}/${id}`, { method: 'DELETE' });

export const fetchItem = (endpoint: string) => (id: string | number) => 
  apiCall(`${endpoint}/${id}`);

export const fetchItems = (endpoint: string) => (params?: Record<string, string | number>) => 
  apiCall(endpoint, { params });

// Bulk operations
export const bulkUpdate = (endpoint: string) => (data: { ids: number[]; updates: Record<string, any> }) => 
  apiCall(`${endpoint}/bulk`, { method: 'PATCH', data });

export const bulkDelete = (endpoint: string) => (ids: number[]) => 
  apiCall(`${endpoint}/bulk`, { method: 'DELETE', data: { ids } });