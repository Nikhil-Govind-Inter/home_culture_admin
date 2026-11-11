import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const homeHighlightSchema = z.object({
  media_path: commonValidations.requiredFile("Image"),
  media_alt: commonValidations.requiredString("Image Alt Text"),
  title: commonValidations.requiredString("Title"),
  sort_order: commonValidations.sortOrder,
  status: commonValidations.booleanStatus,
});

export type HomeHighlightFormData = z.infer<typeof homeHighlightSchema>;
