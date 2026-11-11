import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const homeSimplyChooseSchema = z.object({
  title: commonValidations.requiredString("Title"),
  sort_order: commonValidations.sortOrder,
  status: commonValidations.booleanStatus,
});

export type HomeSimplyChooseFormData = z.infer<typeof homeSimplyChooseSchema>;
