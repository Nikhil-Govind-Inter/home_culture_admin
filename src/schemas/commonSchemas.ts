import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const socialMediaSchema = z.object({
  media_path: commonValidations.requiredFile("Icon"),
  footer_media_path: z.custom<File | string>().optional(),
  media_alt: commonValidations.requiredString("Alt text"),
  link: commonValidations.requiredString("Link"),
  sort_order: commonValidations.sortOrder,
  is_active: commonValidations.booleanStatus,
});

export type SocialMediaFormData = z.infer<typeof socialMediaSchema>;
