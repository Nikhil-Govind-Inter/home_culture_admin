import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

// Pages whose banner has no image, so the image fields are hidden and optional.
export const IMAGELESS_BANNER_SLUGS = ["privacy-policy"];

const requiredAlt = commonValidations.requiredString("Image alt text");
const requiredDesktop = commonValidations.requiredFile("Desktop image");
const requiredThumbnail = commonValidations.requiredFile("Thumbnail");
const requiredMobile = commonValidations.requiredFile("Mobile image");

export const bannerSchema = z
  .object({
    // Read-only in the form; shown for context, never submitted.
    page: z.string().optional(),
    page_slug: commonValidations.requiredString("Page slug"),
    header_title: commonValidations.requiredString("Header title"),
    title: commonValidations.requiredString("Title"),
    description: commonValidations.requiredText("Description"),
    media_type: z.enum(["image", "video"]),
    banner_media_alt: z.string().optional(),
    status: z.boolean(),
    // File (new upload) or non-empty string (existing stored path).
    banner_desktop_media_path: z.any().optional(),
    banner_mobile_media_path: z.any().optional(),
    banner_thumbnail_media_path: z.any().optional(),
  })
  .superRefine((data, ctx) => {
    if (IMAGELESS_BANNER_SLUGS.includes(data.page_slug)) return;
    const checks: [keyof typeof data, z.ZodTypeAny][] = [
      ["banner_media_alt", requiredAlt],
      ["banner_desktop_media_path", requiredDesktop],
      data.media_type === "video"
        ? ["banner_thumbnail_media_path", requiredThumbnail]
        : ["banner_mobile_media_path", requiredMobile],
    ];
    for (const [field, schema] of checks) {
      const result = schema.safeParse(data[field]);
      if (!result.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [field],
          message: result.error.issues[0]?.message ?? "Required",
        });
      }
    }
  });

export type BannerFormData = z.infer<typeof bannerSchema>;
