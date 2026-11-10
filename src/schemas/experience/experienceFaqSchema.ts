import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const experienceFaqSchema = z.object({
  question: commonValidations.requiredString("Question", 100),
  answer: commonValidations.requiredText("Answer"),
  sort_order: commonValidations.sortOrder,
  status: commonValidations.booleanStatus,
});

export type ExperienceFaqFormData = z.infer<typeof experienceFaqSchema>;
