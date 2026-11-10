import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const experienceFeatureSchema = z.object({
  media_path: commonValidations.requiredFile("Icon"),
  title: commonValidations.requiredString("Title", 100),
  sort_order: commonValidations.sortOrder,
  status: commonValidations.booleanStatus,
});

export type ExperienceFeatureFormData = z.infer<typeof experienceFeatureSchema>;
