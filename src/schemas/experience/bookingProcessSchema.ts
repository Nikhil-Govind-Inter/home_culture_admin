import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const bookingProcessSchema = z.object({
  title: commonValidations.requiredString("Title", 100),
  description: commonValidations.requiredString("Description"),
  sort_order: commonValidations.sortOrder,
  status: commonValidations.booleanStatus,
});

export type BookingProcessFormData = z.infer<typeof bookingProcessSchema>;
