import { commonValidations } from "@/utils/formUtils";
import { z } from "zod";

export const loginSchema = z.object({
  email: commonValidations.requiredEmail,
  password: commonValidations.requiredString("Password"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
