import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const faqSchema = z.object({
  category_id: z.string().min(1, "Category is required"),
  question: commonValidations.requiredString("Question"),
  answer: commonValidations.requiredText("Answer"),
  sort_order: commonValidations.sortOrder,
  status: commonValidations.booleanStatus,
});

export type FaqFormData = z.infer<typeof faqSchema>;
