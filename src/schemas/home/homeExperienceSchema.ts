import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";
import { mediaMatchError, missingFileError } from "@/schemas/home/mediaRules";

export const homeExperienceSchema = z.object({
  title: commonValidations.requiredString("Title"),
  media_type: z.enum(["image", "video"]),
  media_alt: commonValidations.requiredString("Media Alt Text"),
  media_path: z.any().optional(),
  thumbnail: z.any().optional(),
  sort_order: commonValidations.sortOrder,
  status: commonValidations.booleanStatus,
});

export type HomeExperienceFormData = z.infer<typeof homeExperienceSchema>;

// Media-type dependent checks, merged into the resolver errors (see buildMediaResolver).
export const homeExperienceConditionalErrors = (data: HomeExperienceFormData) => {
  const errors: Partial<Record<keyof HomeExperienceFormData, string>> = {};
  const label = data.media_type === "video" ? "Video" : "Image";
  const media_pathError =
    missingFileError(data.media_path, label) ?? mediaMatchError(data.media_path, data.media_type, label);
  if (media_pathError) errors.media_path = media_pathError;
  if (data.media_type === "video") {
    const e = missingFileError(data.thumbnail, "Thumbnail");
    if (e) errors.thumbnail = e;
  }
  return errors;
};
