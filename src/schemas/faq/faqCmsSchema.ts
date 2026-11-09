import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

const short = commonValidations.requiredString;
const text = commonValidations.requiredText;
const file = commonValidations.requiredFile;

export const faqCmsSchema = z.object({
  // Section One
  section_one_status: z.boolean(),
  section_one_media_path: file("Section one image"),
  section_one_media_alt: short("Section one image alt text"),
  section_one_header_title: short("Section one header title"),
  section_one_title: short("Section one title"),
  section_one_description: text("Section one description"),

  // Sidebar
  status: z.boolean(),
  sidebar_title: short("Sidebar title"),
  sidebar_quotes: text("Sidebar quotes"),

  // Section Two
  section_two_status: z.boolean(),
  section_two_header_title: short("Section two header title"),
  section_two_title: short("Section two title"),
  section_two_description: text("Section two description"),
  section_two_button_text: short("Section two button text"),
  section_two_button_link: text("Section two button link"),
});

export type FaqCmsFormData = z.infer<typeof faqCmsSchema>;
