import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const socialMediaSchema = z.object({
  icon_media_path: commonValidations.requiredFile("Icon"),
  media_alt: commonValidations.requiredString("Alt text"),
  link: commonValidations.requiredLink,
  sort_order: commonValidations.sortOrder,
  status: commonValidations.booleanStatus,
});

export type SocialMediaFormData = z.infer<typeof socialMediaSchema>;
