import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

const short = commonValidations.requiredString;
const text = commonValidations.requiredText;
const file = commonValidations.requiredFile;

export const aboutCmsSchema = z.object({
  // Story Section
  story_section_status: z.boolean(),
  story_section_media_path: file("Story image"),
  story_section_media_alt: short("Story image alt text"),
  story_section_header_title: short("Story header title"),
  story_section_title: short("Story title"),
  story_section_description: text("Story description"),

  // Philosophy Section
  philosophy_section_status: z.boolean(),
  philosophy_section_media_path: file("Philosophy image"),
  philosophy_section_media_alt: short("Philosophy image alt text"),
  philosophy_section_header_title: short("Philosophy header title"),
  philosophy_section_title: short("Philosophy title"),
  philosophy_section_description: text("Philosophy description"),

  // Mission
  mission_title: short("Mission title"),
  mission_icon: file("Mission icon"),
  mission_description: text("Mission description"),

  // Vision
  vision_title: short("Vision title"),
  vision_icon: file("Vision icon"),
  vision_description: text("Vision description"),

  // Highlight Section
  highlight_section_status: z.boolean(),
  highlight_section_header_title: short("Highlight header title"),
  highlight_section_title: short("Highlight title"),

  // Promise Section
  promise_section_status: z.boolean(),
  promise_section_left_media_path: file("Promise left image"),
  promise_section_left_media_alt: short("Promise left image alt text"),
  promise_section_right_media_path: file("Promise right image"),
  promise_section_right_media_alt: short("Promise right image alt text"),
  promise_section_header_title: short("Promise header title"),
  promise_section_title: short("Promise title"),
  promise_section_description: text("Promise description"),

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

export type AboutCmsFormData = z.infer<typeof aboutCmsSchema>;
