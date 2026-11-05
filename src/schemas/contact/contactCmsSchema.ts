import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const contactCmsSchema = z.object({
  title: commonValidations.requiredString("Title"),
  description: commonValidations.requiredString("Description"),
  form_title: commonValidations.requiredString("Form title"),
  social_media_title: commonValidations.requiredString("Social media title"),
  map_url: commonValidations.requiredString("Map URL"),
});

export type ContactCmsFormData = z.infer<typeof contactCmsSchema>;
