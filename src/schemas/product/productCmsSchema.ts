import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

const short = commonValidations.requiredString;
const text = commonValidations.requiredText;
const file = commonValidations.requiredFile;

export const productCmsSchema = z.object({
  // Product / Style / Trim / Size / Add-ons sections
  product_section_title: short("Product Section title"),
  product_section_description: text("Product Section description"),
  style_section_title: short("Style Section title"),
  style_section_description: text("Style Section description"),
  trim_section_title: short("Trim Section title"),
  trim_section_description: text("Trim Section description"),
  size_section_title: short("Size Section title"),
  size_section_description: text("Size Section description"),
  add_ons_section_title: short("Add-ons Section title"),
  add_ons_section_description: text("Add-ons Section description"),

  // Summary Section
  summary_section_title: short("Summary title"),
  summary_section_description: text("Summary description"),
  summary_section_media_path: file("Summary image"),
  summary_section_media_alt: short("Summary image alt text"),
  summary_section_media_header_title: short("Summary image header title"),
  summary_section_media_title: short("Summary image title"),

  // CTA Section
  cta_section_status: z.boolean(),
  cta_section_desktop_media_path: file("CTA desktop image"),
  cta_section_mobile_media_path: file("CTA mobile image"),
  cta_section_media_alt: short("CTA image alt text"),
  cta_section_header_title: short("CTA header title"),
  cta_section_title: short("CTA title"),
  cta_section_description: text("CTA description"),
  cta_section_button_text: short("CTA button text"),
  cta_section_button_link: text("CTA button link"),
});

export type ProductCmsFormData = z.infer<typeof productCmsSchema>;
