import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const testimonialSchema = z.object({
  media_path: commonValidations.requiredFile("Profile image"),
  name: commonValidations.requiredString("Name"),
  designation: commonValidations.requiredString("Designation"),
  quotes: commonValidations.requiredText("Quotes"),
  sort_order: commonValidations.sortOrder,
  status: commonValidations.booleanStatus,
});

export type TestimonialFormData = z.infer<typeof testimonialSchema>;
