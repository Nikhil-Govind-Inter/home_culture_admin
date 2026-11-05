import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const aboutHighlightSchema = z.object({
  icon_media_path: commonValidations.requiredFile("Icon"),
  title: commonValidations.requiredString("Title"),
  description: commonValidations.requiredText("Description"),
  sort_order: commonValidations.sortOrder,
  status: commonValidations.booleanStatus,
});

export type AboutHighlightFormData = z.infer<typeof aboutHighlightSchema>;
