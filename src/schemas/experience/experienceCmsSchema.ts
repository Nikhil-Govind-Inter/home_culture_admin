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
  visit_section_media_type: z.enum(["image", "video"]),
  visit_section_media_path: file("Visit media"),
  visit_section_thumbnail: z.any().optional(),
  visit_section_media_alt: short("Visit media alt text"),
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

const hasFile = (v: unknown) =>
  v instanceof File || (typeof v === "string" && v.trim().length > 0);

// Media-type dependent checks, merged into the resolver errors by the form.
export const experienceCmsConditionalErrors = (data: ExperienceCmsFormData) => {
  const errors: Partial<Record<keyof ExperienceCmsFormData, string>> = {};
  const wantVideo = data.visit_section_media_type === "video";

  // Visit media must match the chosen type (File mime type, or stored path extension).
  const media = data.visit_section_media_path;
  if (hasFile(media)) {
    const ok =
      media instanceof File
        ? media.type.startsWith(wantVideo ? "video/" : "image/")
        : (wantVideo ? /\.(mp4|webm)$/i : /\.(jpe?g|png|webp|gif)$/i).test(
            String(media).split("?")[0],
          );
    if (!ok) {
      errors.visit_section_media_path = wantVideo
        ? "Visit video must be a valid video file (mp4 or webm)"
        : "Visit image must be a valid image file (jpg, png, webp or gif)";
    }
  }

  if (wantVideo && !hasFile(data.visit_section_thumbnail)) {
    errors.visit_section_thumbnail = "Thumbnail is required";
  }
  return errors;
};
