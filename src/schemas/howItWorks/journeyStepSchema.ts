import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const journeyStepSchema = z.object({
  title: commonValidations.requiredString("Title"),
  description: commonValidations.requiredString("Description"),
  sort_order: commonValidations.sortOrder,
  status: commonValidations.booleanStatus,
});

export type JourneyStepFormData = z.infer<typeof journeyStepSchema>;
