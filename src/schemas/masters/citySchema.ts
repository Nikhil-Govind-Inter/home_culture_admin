import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const citySchema = z.object({
  state: z.string().min(1, "State is required"),
  name: commonValidations.requiredString("Name"),
  slug: commonValidations.requiredString("Slug"),
  sort_order: commonValidations.sortOrder,
  status: commonValidations.booleanStatus,
});

export type CityFormData = z.infer<typeof citySchema>;
