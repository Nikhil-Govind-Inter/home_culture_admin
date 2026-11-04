import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const bannerSchema = z.object({
  // Read-only in the form; shown for context, never submitted.
  page: z.string().optional(),
  page_slug: commonValidations.requiredString("Page slug"),
  header_title: commonValidations.requiredString("Header title"),
  title: commonValidations.requiredString("Title"),
  description: commonValidations.requiredString("Description"),
  banner_media_alt: commonValidations.requiredString("Image alt text"),
  status: z.boolean(),
  // File (new upload) or non-empty string (existing stored path).
  banner_desktop_media_path: commonValidations.requiredFile("Desktop image"),
  banner_mobile_media_path: commonValidations.requiredFile("Mobile image"),
});

export type BannerFormData = z.infer<typeof bannerSchema>;
