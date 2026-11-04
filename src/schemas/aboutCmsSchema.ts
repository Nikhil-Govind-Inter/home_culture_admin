import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const aboutCmsSchema = z.object({
  about_title: commonValidations.requiredString("About Title"),
  about_description: commonValidations.requiredString("About Description"),
  media_path: commonValidations.requiredFile("Media"),
  media_alt: commonValidations.requiredString("Alt text"),
  trust_title: commonValidations.requiredString("Trust Title"),
  trust_description: commonValidations.requiredString("Trust Description"),
  mission_title: commonValidations.requiredString("Mission Title"),
  vision_title: commonValidations.requiredString("Vision Title"),
  mission_description: commonValidations.requiredString("Mission Description"),
  vision_description: commonValidations.requiredString("Vision Description"),
  history_title: commonValidations.requiredString("History Title"),
  message_title: commonValidations.requiredString("Message Title"),
  message_subtitle: commonValidations.requiredString("Message Subtitle"),
  work_title: commonValidations.requiredString("Work Title"),
  work_media_path: commonValidations.requiredFile("Work Media"),
  work_media_alt: commonValidations.requiredString("Work Media Alt text"),
  about_core_title: commonValidations.requiredString("About Core Title"),
  about_core_description: commonValidations.requiredString("About Core Description"),
  about_code_media_path: commonValidations.requiredFile("About Core Media"),
  about_code_media_alt: commonValidations.requiredString("About Core Media Alt text"),
  features_title: commonValidations.requiredString("Features Title"),
  features_sub_title: commonValidations.requiredString("Features Subtitle"),
  features_description: commonValidations.requiredString(
    "Features Description",
  ),
  industry_title: commonValidations.requiredString("Industry Title"),
  industry_description: commonValidations.requiredString(
    "Industry Description",
  ),
  industry_media_path: commonValidations.requiredFile("Industry Media"),
  industry_media_alt: commonValidations.requiredString("Industry Media Alt text"),
});

export type AboutCmsFormData = z.infer<typeof aboutCmsSchema>;