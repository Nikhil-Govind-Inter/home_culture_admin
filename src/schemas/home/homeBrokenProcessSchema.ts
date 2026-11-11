import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";
import { mediaMatchError, missingFileError } from "@/schemas/home/mediaRules";

export const homeBrokenProcessSchema = z.object({
  title: commonValidations.requiredString("Title"),
  media_type: z.enum(["image", "video"]),
  media_alt: commonValidations.requiredString("Media Alt Text"),
  desktop_media_path: commonValidations.requiredFile("Desktop media"),
  mobile_media_path: z.any().optional(),
  thumbnail: z.any().optional(),
  sort_order: commonValidations.sortOrder,
  status: commonValidations.booleanStatus,
});

export type HomeBrokenProcessFormData = z.infer<typeof homeBrokenProcessSchema>;

// Media-type dependent checks, merged into the resolver errors (see buildMediaResolver).
export const homeBrokenProcessConditionalErrors = (data: HomeBrokenProcessFormData) => {
  const errors: Partial<Record<keyof HomeBrokenProcessFormData, string>> = {};
  const desktop_media_pathError = mediaMatchError(data.desktop_media_path, data.media_type, "Desktop");
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
