import { z } from "zod";

export const privacyPolicySchema = z.object({
  // Content Section
  content_section_status: z.boolean(),
  content_section_side_title: z
    .string()
    .min(1, "Side title is required")
    .max(255, "Side title must be 255 characters or less"),
  content: z
    .string()
    .min(1, "Content is required")
    .refine(
      (value) =>
        /<(img|iframe|video)\b/i.test(value) ||
        value.replace(/<[^>]*>/g, "").replace(/&nbsp;|\s/g, "").length > 0,
      { message: "Content is required" },
    ),

  // CTA Section
  cta_section_status: z.boolean(),
  // File (new upload) or non-empty string (existing stored path).
  cta_section_desktop_media_path: z.custom<File | string>(
    (val) => val instanceof File || (typeof val === "string" && val.trim().length > 0),
    { message: "CTA desktop image is required" },
  ),
  cta_section_mobile_media_path: z.custom<File | string>(
    (val) => val instanceof File || (typeof val === "string" && val.trim().length > 0),
    { message: "CTA mobile image is required" },
  ),
  cta_section_media_alt: z
    .string()
    .min(1, "CTA image alt text is required")
    .max(255, "CTA image alt text must be 255 characters or less"),
  cta_section_header_title: z
    .string()
    .min(1, "CTA header title is required")
    .max(255, "CTA header title must be 255 characters or less"),
  cta_section_title: z
    .string()
    .min(1, "CTA title is required")
    .max(255, "CTA title must be 255 characters or less"),
  cta_section_description: z.string().min(1, "CTA description is required"),
  cta_section_button_text: z
    .string()
    .min(1, "CTA button text is required")
    .max(255, "CTA button text must be 255 characters or less"),
  cta_section_button_link: z.string().min(1, "CTA button link is required"),
});

export type PrivacyPolicyFormData = z.infer<typeof privacyPolicySchema>;
