import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const siteSettingsSchema = z.object({
  // File (new upload) or non-empty string (existing stored path).
  header_logo: commonValidations.requiredFile("Header logo"),
  footer_logo: commonValidations.requiredFile("Footer logo"),
  header_logo_alt: commonValidations.requiredString("Header logo alt text"),
  footer_logo_alt: commonValidations.requiredString("Footer logo alt text"),
  header_button_text: commonValidations.requiredString("Header button text"),
  header_button_link: commonValidations.requiredString("Header button link"),
  footer_title: commonValidations.requiredString("Footer title"),
  description: commonValidations.requiredText("Description"),
  address: commonValidations.requiredText("Address"),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email"),
  phone: commonValidations.requiredString("Phone"),
});

export type SiteSettingsFormData = z.infer<typeof siteSettingsSchema>;
