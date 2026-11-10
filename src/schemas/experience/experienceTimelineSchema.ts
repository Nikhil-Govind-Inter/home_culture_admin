import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const experienceTimelineSchema = z.object({
  media_path: commonValidations.requiredFile("Image"),
  media_alt: commonValidations.requiredString("Image Alt Text"),
  title: commonValidations.requiredString("Title", 100),
  subtitle: commonValidations.requiredString("Subtitle"),
  sort_order: commonValidations.sortOrder,
  status: commonValidations.booleanStatus,
});

export type ExperienceTimelineFormData = z.infer<typeof experienceTimelineSchema>;
