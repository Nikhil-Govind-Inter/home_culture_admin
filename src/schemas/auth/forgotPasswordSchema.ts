import { commonValidations } from "@/utils/formUtils";
import { z } from "zod";

export const forgotEmailSchema = z.object({
  email: commonValidations.requiredEmail,
});

export const otpSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, "Enter the 6-digit code"),
});

export const resetPasswordSchema = z
  .object({
    newPassword: commonValidations.requiredPassword,
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ForgotEmailData = z.infer<typeof forgotEmailSchema>;
export type OtpData = z.infer<typeof otpSchema>;
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;
