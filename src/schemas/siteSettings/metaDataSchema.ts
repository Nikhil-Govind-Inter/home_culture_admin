import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const metaDataSchema = z.object({
  // Read-only in the form, but the server requires both on update.
  page: commonValidations.requiredString("Page"),
  page_slug: commonValidations.requiredString("Page slug"),
  meta_title: commonValidations.requiredString("Meta title"),
  meta_description: commonValidations.requiredText("Meta description"),
  meta_keywords: commonValidations.requiredString("Meta keywords"),
});

export type MetaDataFormData = z.infer<typeof metaDataSchema>;
