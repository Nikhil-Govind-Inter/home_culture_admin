import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

const short = commonValidations.requiredString;

export const careerCmsSchema = z.object({
  // Life at home section
  life_at_home_status: z.boolean(),
  life_at_home_header_title: short("Header title"),
  life_at_home_title: short("Title"),
  life_at_home_quote: commonValidations.requiredText("Quote"),
  life_at_home_description: commonValidations.requiredText("Description"),
  life_at_home_skills_title: short("Skills title"),

  // Why join us section
  why_join_us_status: z.boolean(),
  why_join_us_header_title: short("Header title", 100),
  why_join_us_title: short("Title", 100),
  why_join_us_description: short("Description"),

  // Media
  media_one_path: commonValidations.requiredFile("Image one"),
  media_one_alt: short("Image one alt text"),
  media_two_path: commonValidations.requiredFile("Image two"),
  media_two_alt: short("Image two alt text"),
  media_three_path: commonValidations.requiredFile("Image three"),
  media_three_alt: short("Image three alt text"),
  media_four_path: commonValidations.requiredFile("Image four"),
  media_four_alt: short("Image four alt text"),

  // Current opening section
  current_opening_status: z.boolean(),
  current_opening_header_title: short("Header title", 100),
  current_opening_title: short("Title", 100),
  current_opening_description: short("Description"),

  // Testimonial section
  testimonial_status: z.boolean(),
  testimonial_header_title: short("Header title", 100),
  testimonial_title: short("Title", 100),
  testimonial_description: short("Description"),

  // CTA section
  cta_status: z.boolean(),
  cta_desktop_media_path: commonValidations.requiredFile("Desktop image"),
  cta_mobile_media_path: commonValidations.requiredFile("Mobile image"),
  cta_media_alt: short("Image alt text"),
  cta_header_title: short("Header title"),
  cta_title: short("Title"),
  cta_description: commonValidations.richText("Description"),
  cta_button_text: short("Button text"),
  cta_button_link: short("Button link"),
});

export type CareerCmsFormData = z.infer<typeof careerCmsSchema>;
