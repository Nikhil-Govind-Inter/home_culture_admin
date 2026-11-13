import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

// Selected records are identified by their slug.
const slugList = z.array(z.string());

export const productSchema = z.object({
  media_path: commonValidations.requiredFile("Image"),
  media_alt: commonValidations.requiredString("Image Alt Text"),
  icon_media_path: z.custom<File | string>().optional(),
  icon_media_alt: z.string().max(255).optional(),
  title: commonValidations.requiredString("Title"),
  slug: commonValidations.requiredString("Slug"),
  excerpt: commonValidations.requiredString("Excerpt"),
  header_title: commonValidations.requiredString("Header Title"),
  description: commonValidations.requiredString("Description"),
  button_text: commonValidations.requiredString("Button Text"),

  // Many-to-many selections (each can be empty).
  style_slugs: slugList,
  trim_slugs: slugList,
  size_slugs: slugList,
  add_ons_slugs: slugList,

  sort_order: commonValidations.sortOrder,
  status: commonValidations.booleanStatus,
  show_in_home: z.boolean(),
});

export type ProductFormData = z.infer<typeof productSchema>;
