import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const productAddOnSchema = z.object({
  media_path: commonValidations.requiredFile("Image"),
  title: commonValidations.requiredString("Title"),
  slug: commonValidations.requiredString("Slug"),
  subtitle: commonValidations.requiredString("Subtitle"),
  sort_order: commonValidations.sortOrder,
  status: commonValidations.booleanStatus,
});

export type ProductAddOnFormData = z.infer<typeof productAddOnSchema>;
