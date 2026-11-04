import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const bannerSchema = z.object({
  title: commonValidations.requiredString("Title"),
  subtitle: commonValidations.optionalString,
  link: commonValidations.optionalString,
  sortOrder: z
    .string()
    .refine((val) => val === "" || (!isNaN(parseInt(val)) && parseInt(val) >= 0), {
      message: "Sort order must be 0 or greater",
    }),
  status: commonValidations.publishStatus,
  image: commonValidations.requiredFile("Image"),
});

export type BannerFormData = z.infer<typeof bannerSchema>;
