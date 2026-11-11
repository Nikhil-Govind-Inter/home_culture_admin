import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const jobSchema = z.object({
  // UI only: picks the state whose cities are offered; not sent to the server.
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
  department: z.string().min(1, "Department is required"),
  position: commonValidations.requiredString("Position"),
  slug: commonValidations.requiredString("Slug"),
  posted_at: commonValidations.optionalDate,
  sort_order: commonValidations.sortOrder,
  status: commonValidations.booleanStatus,
});

export type JobFormData = z.infer<typeof jobSchema>;
