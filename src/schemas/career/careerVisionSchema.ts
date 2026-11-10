import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const careerVisionSchema = z.object({
  title: commonValidations.requiredString("Title"),
  description: commonValidations.requiredText("Description"),
  sort_order: commonValidations.sortOrder,
  status: commonValidations.booleanStatus,
});

export type CareerVisionFormData = z.infer<typeof careerVisionSchema>;
