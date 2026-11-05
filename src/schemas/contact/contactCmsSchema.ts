import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

const short = commonValidations.requiredString;
const text = commonValidations.requiredText;

export const contactCmsSchema = z.object({
  // Form Section
  form_section_status: z.boolean(),
  form_section_title: short("Form section title"),
  form_section_description: text("Form section description"),

  google_map_link: text("Google map link"),

  // Form
  form_title: short("Form title"),
  form_description: text("Form description"),

  // FAQ Section
  faq_section_status: z.boolean(),
  faq_section_title: short("FAQ section title"),
  faq_section_description: text("FAQ section description"),
  faq_section_button_text: short("FAQ button text"),
  faq_section_button_link: text("FAQ button link"),
});

export type ContactCmsFormData = z.infer<typeof contactCmsSchema>;
