import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const productTrimSchema = z.object({
  media_path: commonValidations.requiredFile("Image"),
  media_alt: commonValidations.requiredString("Image Alt Text"),
  title: commonValidations.requiredString("Title"),
  description: commonValidations.requiredString("Description"),
  sort_order: commonValidations.sortOrder,
  status: commonValidations.booleanStatus,
});

export type ProductTrimFormData = z.infer<typeof productTrimSchema>;
