import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const blogSchema = z.object({
  title: commonValidations.requiredString("Title"),
  slug: commonValidations.optionalString,
  excerpt: commonValidations.optionalString,
  content: commonValidations.optionalRichText,
  status: commonValidations.publishStatus,
  image: commonValidations.fileUpload,
});

export type BlogFormData = z.infer<typeof blogSchema>;
