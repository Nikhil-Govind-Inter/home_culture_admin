import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const blogCategorySchema = z.object({
  title: commonValidations.requiredString("Title"),
  // Auto-filled from the title in the form; the server generates one if left empty.
  slug: commonValidations.requiredString("Slug"),
  sort_order: commonValidations.sortOrder,
  status: commonValidations.booleanStatus,
});

export type BlogCategoryFormData = z.infer<typeof blogCategorySchema>;
