import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const departmentSchema = z.object({
  name: commonValidations.requiredString("Name"),
  slug: commonValidations.requiredString("Slug"),
  sort_order: commonValidations.sortOrder,
  status: commonValidations.booleanStatus,
});

export type DepartmentFormData = z.infer<typeof departmentSchema>;
