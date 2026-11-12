import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const productStyleSchema = z.object({
  media_path: commonValidations.requiredFile("Image"),
  media_alt: commonValidations.requiredString("Image Alt Text"),
  title: commonValidations.requiredString("Title"),
  description: commonValidations.requiredString("Description"),
  button_text: commonValidations.requiredString("Button Text"),
  sort_order: commonValidations.sortOrder,
  status: commonValidations.booleanStatus,
});

export type ProductStyleFormData = z.infer<typeof productStyleSchema>;
