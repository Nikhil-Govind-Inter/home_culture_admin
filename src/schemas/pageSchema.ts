import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const pageSchema = z.object({
  title: commonValidations.requiredString("Title"),
  slug: commonValidations.optionalString,
  content: commonValidations.optionalRichText,
  metaTitle: commonValidations.optionalString,
  metaDescription: commonValidations.optionalString,
  status: commonValidations.publishStatus,
});

export type PageFormData = z.infer<typeof pageSchema>;
