import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

const short = commonValidations.requiredString;
const text = commonValidations.requiredText;
const file = commonValidations.requiredFile;

export const experienceCmsSchema = z.object({
  // Intro Section
  intro_section_status: z.boolean(),
  intro_section_media_path: file("Intro image"),
  intro_section_media_alt: short("Intro image alt text"),
  intro_section_header_title: short("Intro header title"),
  intro_section_title: short("Intro title"),
  intro_section_quote: text("Intro quote"),
  intro_section_description: text("Intro description"),

  // Journey Section
  journey_section_status: z.boolean(),
  journey_section_header_title: short("Journey header title"),
  journey_section_title: short("Journey title"),
  journey_section_description: text("Journey description"),

  // Lifestyle Section
  lifestyle_status: z.boolean(),
  lifestyle_header_title: short("Lifestyle header title"),
  lifestyle_title: short("Lifestyle title"),
  lifestyle_description: text("Lifestyle description"),

  // Visit Section
  visit_section_status: z.boolean(),
  visit_section_media_path: file("Visit image"),
  visit_section_media_alt: short("Visit image alt text"),
  visit_section_header_title: short("Visit header title"),
  visit_section_title: short("Visit title"),
  visit_section_description: text("Visit description"),

  // Feature Section
  feature_section_status: z.boolean(),
  feature_section_header_title: short("Feature header title"),
  feature_section_title: short("Feature title"),

  // Booking Process Section
  booking_process_status: z.boolean(),
  booking_process_header_title: short("Booking Process header title"),
  booking_process_title: short("Booking Process title"),

  // FAQ Section
  faq_section_status: z.boolean(),
  faq_section_header_title: short("FAQ header title"),
  faq_section_title: short("FAQ title"),
  faq_section_description: text("FAQ description"),

  // Enquiry Section
  enquiry_section_status: z.boolean(),
  enquiry_section_header_title: short("Enquiry header title"),
  enquiry_section_title: short("Enquiry title"),
  enquiry_section_description: text("Enquiry description"),
});

export type ExperienceCmsFormData = z.infer<typeof experienceCmsSchema>;
