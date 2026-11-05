import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

const short = commonValidations.requiredString;
const text = commonValidations.requiredText;
const file = commonValidations.requiredFile;

export const howItWorksCmsSchema = z.object({
  // Vision Section
  vision_section_status: z.boolean(),
  vision_section_media_path: file("Vision image"),
  vision_section_media_alt: short("Vision image alt text"),
  vision_section_header_title: short("Vision header title"),
  vision_section_title: short("Vision title"),
  vision_section_description: text("Vision description"),

  // Workshop Section
  workshop_section_status: z.boolean(),
  workshop_section_media_path: file("Workshop image"),
  workshop_section_media_alt: short("Workshop image alt text"),
  workshop_section_header_title: short("Workshop header title"),
  workshop_section_title: short("Workshop title"),
  workshop_section_description: text("Workshop description"),

  // Artisans Section
  artisans_section_status: z.boolean(),
  artisans_section_header_title: short("Artisans header title"),
  artisans_section_title: short("Artisans title"),
  artisans_section_description: text("Artisans description"),

  // Journey Section
  journey_section_status: z.boolean(),
  journey_section_title: short("Journey title"),
  journey_section_media_path: file("Journey image"),
  journey_section_media_alt: short("Journey image alt text"),

  // CTA Section
  cta_status: z.boolean(),
  cta_desktop_media_path: file("CTA desktop image"),
  cta_mobile_media_path: file("CTA mobile image"),
  cta_media_alt: short("CTA image alt text"),
  cta_header_title: short("CTA header title"),
  cta_title: short("CTA title"),
  cta_description: text("CTA description"),
  cta_button_text: short("CTA button text"),
  cta_button_link: text("CTA button link"),
});

export type HowItWorksCmsFormData = z.infer<typeof howItWorksCmsSchema>;
