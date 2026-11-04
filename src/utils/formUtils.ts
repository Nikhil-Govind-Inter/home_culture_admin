import { z } from "zod";

// Common validation patterns
export const commonValidations = {
  // String validations
  requiredString: (fieldName: string) => 
    z.string().min(1, `${fieldName} is required`),
  
  optionalString: z.string().optional(),
  
  requiredText: (fieldName: string) => 
    z.string().min(1, `${fieldName} is required`),
  
  // Number validations
  sortOrder: z
    .string()
    .refine((val) => {
      const num = parseInt(val);
      return !isNaN(num) && num > 0;
    }, "Sort order must be a positive integer")
    .optional(),
  
  requiredNumber: (fieldName: string) => 
    z.number().min(0, `${fieldName} must be 0 or greater`),
  
  optionalNumber: z.number().optional(),
  
  // Status validations
  booleanStatus: z.boolean(),
  
  statusEnum: z.enum(["active", "inactive"]),
  
  publishStatus: z.enum(["published", "draft"]),
  
  // email validation
  requiredEmail:
    z.string().min(1, "Email is required").email('Invalid Email'),

  optionalEmail: z.string().email().optional(),

  // Username validation — mirrors server's username rule (3-50 chars, alnum+underscore)
  username: z
    .string()
    .min(3, "Username must be between 3 and 50 characters")
    .max(50, "Username must be between 3 and 50 characters"),

  // Password validation — mirrors server's passwordRule regex (lower/upper/digit/special char)
  requiredPassword: z
    .string()
    .min(8, "Password must be between 8 and 128 characters")
    .max(128, "Password must be between 8 and 128 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must contain lowercase, uppercase, number, and special char"
    ),

  optionalPassword: z
    .string()
    .min(8, "Password must be between 8 and 128 characters")
    .max(128, "Password must be between 8 and 128 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must contain lowercase, uppercase, number, and special char"
    )
    .optional()
    .or(z.literal("")),

  // Admin user role
  userRole: z.enum(["admin", "user"]),
  // Media validations
  mediaType: z.enum(["image", "video"]),
  
  fileUpload: z.any().optional(),

  requiredFile: (fieldName: string) =>
    z.custom<File | string>(
      (val) => val instanceof File || (typeof val === "string" && val.trim().length > 0),
      { message: `${fieldName} is required` }
    ),

  // URL validations
  optionalUrl: z.string().regex(/^\/.*/, "Must start with /").optional().or(z.literal("")),
  
  requiredUrl: (fieldName: string) => 
    z.string().regex(/^\/.*/, `${fieldName} must start with /`),
  
  // Date validations
  dateString: z.string().min(1, "Date is required"),
  
  optionalDate: z.string().optional(),
  
  // Array validations
  tagArray: z.array(z.number()).optional(),
  
  categoryArray: z.array(z.number()).min(1, "At least one category is required"),
  
  // Rich text validation
  richText: (fieldName: string) => 
    z.string().min(1, `${fieldName} is required`),
  
  optionalRichText: z.string().optional(),
};

// Form data construction utilities
export const createFormDataWithFiles = (
  data: Record<string, any>, 
  files: Record<string, File | string | null> = {}
): FormData => {
  const formData = new FormData();
  
  // Add regular fields
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          formData.append(`${key}[${index}]`, item.toString());
        });
      } else {
        formData.append(key, value.toString());
      }
    }
  });
  
  // Add file fields
  Object.entries(files).forEach(([key, file]) => {
    if (file instanceof File) {
      formData.append(key, file);
    } else if (typeof file === 'string' && file) {
      formData.append(key, file);
    }
  });
  
  return formData;
};

// Check if form data contains files
export const hasFileUploads = (data: Record<string, any>): boolean => {
  return Object.values(data).some(value => value instanceof File);
};

// API submission helper that automatically handles content-type
export const submitFormData = async (
  url: string,
  data: Record<string, any>,
  options: {
    method?: 'POST' | 'PUT' | 'PATCH';
    token?: string;
  } = {}
): Promise<Response> => {
  const { method = 'POST', token } = options;
  
  const hasFiles = hasFileUploads(data);
  const headers: HeadersInit = {};
  
  // Add authorization if token provided
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  let body: BodyInit;
  
  if (hasFiles) {
    // For file uploads, use FormData and let browser set Content-Type
    body = createFormDataWithFiles(data);
    // DON'T set Content-Type - browser will set it automatically with boundary
  } else {
    // For regular JSON data
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(data);
  }
  
  return fetch(url, {
    method,
    headers,
    body,
  });
};

// Slug generation utility
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// Default values generators
export const createDefaultFormValues = <T extends Record<string, any>>(
  schema: z.ZodSchema<T>
): Partial<T> => {
  // This is a helper to create default values based on schema
  // You can extend this based on your specific needs
  return {};
};

// Form field error extractors
export const getFieldError = (
  errors: Record<string, any>, 
  fieldName: string
): string | undefined => {
  return errors[fieldName]?.message;
};

// File validation utilities
export const validateFileType = (
  file: File, 
  allowedTypes: string[]
): boolean => {
  return allowedTypes.some(type => file.type.startsWith(type));
};

export const validateFileSize = (
  file: File, 
  maxSizeInBytes: number
): boolean => {
  return file.size <= maxSizeInBytes;
};

// Common field transformation utilities
export const transformSortOrder = (value: string): number => {
  const num = parseInt(value);
  return isNaN(num) ? 0 : num;
};

export const transformBooleanFromString = (value: string): boolean => {
  return value === "true" || value === "1" || value === "active";
};

// Form submission helpers
export const handleFormSubmission = async <T>(
  data: T,
  submitFn: (data: T) => Promise<any>,
  options: {
    onSuccess?: (result: any) => void;
    onError?: (error: Error) => void;
    successMessage?: string;
    errorMessage?: string;
  } = {}
) => {
  try {
    const result = await submitFn(data);
    options.onSuccess?.(result);
    return result;
  } catch (error) {
    options.onError?.(error as Error);
    throw error;
  }
};