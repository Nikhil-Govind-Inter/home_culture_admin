import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const productStyleSchema = z.object({
  media_path: commonValidations.requiredFile("Image"),
  title: commonValidations.requiredString("Title"),
  slug: commonValidations.requiredString("Slug"),
  description: commonValidations.requiredString("Description"),
  sort_order: commonValidations.sortOrder,
  status: commonValidations.booleanStatus,
  show_in_home: z.boolean(),
});

export type ProductStyleFormData = z.infer<typeof productStyleSchema>;
