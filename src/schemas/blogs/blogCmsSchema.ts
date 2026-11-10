import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

const short = commonValidations.requiredString;

export const blogCmsSchema = z.object({
  // Detail page section
  detail_page_status: z.boolean(),
  detail_page_header_title: short("Header title"),
  detail_page_title: short("Title"),
  detail_page_button_text: short("Button text"),
  detail_page_button_link: short("Button link"),

  // CTA section
  cta_status: z.boolean(),
  cta_desktop_media_path: commonValidations.requiredFile("Desktop image"),
  cta_mobile_media_path: commonValidations.requiredFile("Mobile image"),
  cta_media_alt: short("Image alt text"),
  cta_header_title: short("Header title"),
  cta_title: short("Title"),
  cta_description: commonValidations.richText("Description"),
  cta_button_text: short("Button text"),
  cta_button_link: commonValidations.requiredText("Button link"),
});

export type BlogCmsFormData = z.infer<typeof blogCmsSchema>;
