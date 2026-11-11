import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const homeProcessStepSchema = z.object({
  title: commonValidations.requiredString("Title"),
  description: commonValidations.requiredText("Description"),
  sort_order: commonValidations.sortOrder,
  status: commonValidations.booleanStatus,
});

export type HomeProcessStepFormData = z.infer<typeof homeProcessStepSchema>;
