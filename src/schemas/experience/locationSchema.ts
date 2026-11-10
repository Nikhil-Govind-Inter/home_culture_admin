import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const locationSchema = z.object({
  location: commonValidations.requiredString("Location", 100),
  location_link: commonValidations.requiredLink,
  sort_order: commonValidations.sortOrder,
  status: commonValidations.booleanStatus,
});

export type LocationFormData = z.infer<typeof locationSchema>;
