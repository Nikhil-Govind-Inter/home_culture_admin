import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const workshopMaterialSchema = z.object({
  media_path: commonValidations.requiredFile("Image"),
  title: commonValidations.requiredString("Title"),
  sort_order: commonValidations.sortOrder,
  status: commonValidations.booleanStatus,
});

export type WorkshopMaterialFormData = z.infer<typeof workshopMaterialSchema>;
