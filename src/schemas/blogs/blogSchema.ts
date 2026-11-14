import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const blogSchema = z.object({
  category_id: z.string().min(1, "Category is required"),
  title: commonValidations.requiredString("Title"),
  // Auto-filled from the title in the form; the server generates one if left empty.
  slug: commonValidations.optionalString,
  excerpt: commonValidations.requiredString("Excerpt"),
  description: commonValidations.richText("Description"),
  reading_time: z
    .string()
    .min(1, "Reading time is required")
    .refine((val) => {
      const num = parseInt(val);
      return !isNaN(num) && num > 0;
    }, "Reading time must be a positive number of minutes"),

  media_path: commonValidations.requiredFile("Main image"),
  media_alt: commonValidations.requiredString("Main image alt text"),

  sort_order: commonValidations.sortOrder,
  status: commonValidations.booleanStatus,
  is_featured: z.boolean(),
  show_in_home: z.boolean(),
});

export type BlogFormData = z.infer<typeof blogSchema>;
