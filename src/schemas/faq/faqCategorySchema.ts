import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const faqCategorySchema = z.object({
  title: commonValidations.requiredString("Title"),
  // Auto-filled from the title in the form; the server generates one if left empty.
  slug: commonValidations.requiredString("Slug"),
  sort_order: commonValidations.sortOrder,
  status: commonValidations.booleanStatus,
});

export type FaqCategoryFormData = z.infer<typeof faqCategorySchema>;
