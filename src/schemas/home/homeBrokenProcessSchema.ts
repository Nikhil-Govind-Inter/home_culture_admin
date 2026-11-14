import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";
import { mediaMatchError, missingFileError } from "@/schemas/home/mediaRules";

export const homeBrokenProcessSchema = z.object({
  title: commonValidations.requiredString("Title"),
  media_type: z.enum(["image", "video"]),
  media_alt: commonValidations.requiredString("Media Alt Text"),
  media_path: z.any().optional(),
  thumbnail: z.any().optional(),
  sort_order: commonValidations.sortOrder,
  status: commonValidations.booleanStatus,
});

export type HomeBrokenProcessFormData = z.infer<typeof homeBrokenProcessSchema>;

// Media-type dependent checks, merged into the resolver errors (see buildMediaResolver).
export const homeBrokenProcessConditionalErrors = (data: HomeBrokenProcessFormData) => {
  const errors: Partial<Record<keyof HomeBrokenProcessFormData, string>> = {};
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
