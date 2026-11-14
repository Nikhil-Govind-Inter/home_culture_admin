import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";
import { mediaMatchError, missingFileError } from "@/schemas/home/mediaRules";

export const homeBannerSchema = z.object({
  header_title: commonValidations.requiredString("Header Title"),
  title: commonValidations.requiredString("Title"),
  description: commonValidations.requiredText("Description"),
  media_type: z.enum(["image", "video"]),
  media_alt: commonValidations.requiredString("Media Alt Text"),
  desktop_media_path: z.any().optional(),
  mobile_media_path: z.any().optional(),
  thumbnail: z.any().optional(),
  button_one_text: commonValidations.optionalString,
  button_one_link: commonValidations.optionalString,
  button_two_text: commonValidations.optionalString,
  button_two_link: commonValidations.optionalString,
  sort_order: commonValidations.sortOrder,
  status: commonValidations.booleanStatus,
});

export type HomeBannerFormData = z.infer<typeof homeBannerSchema>;

// Media-type dependent checks, merged into the resolver errors (see buildMediaResolver).
export const homeBannerConditionalErrors = (data: HomeBannerFormData) => {
  const errors: Partial<Record<keyof HomeBannerFormData, string>> = {};
  const label = data.media_type === "video" ? "Video" : "Desktop image";
  const desktop_media_pathError =
    missingFileError(data.desktop_media_path, label) ??
    mediaMatchError(data.desktop_media_path, data.media_type, label);
  if (desktop_media_pathError) errors.desktop_media_path = desktop_media_pathError;
  if (data.media_type === "image") {
    const e = missingFileError(data.mobile_media_path, "Mobile Image");
    if (e) errors.mobile_media_path = e;
  }
  if (data.media_type === "video") {
    const e = missingFileError(data.thumbnail, "Thumbnail");
    if (e) errors.thumbnail = e;
  }
  return errors;
};
