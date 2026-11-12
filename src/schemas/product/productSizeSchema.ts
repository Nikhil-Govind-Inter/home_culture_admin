import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const productSizeSchema = z.object({
  media_path: commonValidations.requiredFile("Image"),
  media_alt: commonValidations.requiredString("Image Alt Text"),
  title: commonValidations.requiredString("Title"),
  size: z
    .string()
    .min(1, "Size is required")
    .refine((val) => {
      const num = Number(val);
      return Number.isInteger(num) && num > 0;
    }, "Size must be a positive whole number"),
  sort_order: commonValidations.sortOrder,
  status: commonValidations.booleanStatus,
});

export type ProductSizeFormData = z.infer<typeof productSizeSchema>;
