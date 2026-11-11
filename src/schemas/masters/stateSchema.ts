import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const stateSchema = z.object({
  name: commonValidations.requiredString("Name"),
  slug: commonValidations.requiredString("Slug"),
  sort_order: commonValidations.sortOrder,
  status: commonValidations.booleanStatus,
});

export type StateFormData = z.infer<typeof stateSchema>;
