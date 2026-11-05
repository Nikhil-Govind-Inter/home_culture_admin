import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { BrandPanel } from "@/components/auth/BrandPanel";
import { useToast } from "@/hooks/use-toast";
import { forgotPassword, resetPassword, verifyOtp } from "@/services/auth/authApi";
import {
  forgotEmailSchema,
  otpSchema,
  resetPasswordSchema,
  type ForgotEmailData,
  type OtpData,
  type ResetPasswordData,
} from "@/schemas/auth/forgotPasswordSchema";

type Step = "email" | "otp" | "reset";

const errorText = (e: unknown, fallback: string) => (e instanceof Error ? e.message : fallback);

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [serverError, setServerError] = useState("");
  const [info, setInfo] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const emailForm = useForm<ForgotEmailData>({
    resolver: zodResolver(forgotEmailSchema),
    defaultValues: { email: "" },
  });
  const otpForm = useForm<OtpData>({ resolver: zodResolver(otpSchema), defaultValues: { otp: "" } });
  const resetForm = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const sendOtp = async (values: ForgotEmailData) => {
    setServerError("");
    try {
      const message = await forgotPassword(values.email);
      setEmail(values.email);
      setInfo(message);
      setStep("otp");
    } catch (e) {
      setServerError(errorText(e, "Could not send OTP"));
    }
  };

  const resendOtp = async () => {
    setServerError("");
    try {
      await forgotPassword(email);
      otpForm.reset({ otp: "" });
      setInfo("A new OTP has been sent");
    } catch (e) {
      setServerError(errorText(e, "Could not resend OTP"));
    }
  };

  const checkOtp = async (values: OtpData) => {
    setServerError("");
    try {
      await verifyOtp(email, values.otp);
      setOtp(values.otp);
      setStep("reset");
    } catch (e) {
      setServerError(errorText(e, "Invalid or expired OTP"));
    }
  };

  const submitReset = async (values: ResetPasswordData) => {
    setServerError("");
    try {
      await resetPassword(email, otp, values.newPassword, values.confirmPassword);
      toast({ title: "Password reset", description: "You can now sign in with your new password." });
      navigate("/login", { replace: true });
    } catch (e) {
      setServerError(errorText(e, "Could not reset password"));
    }
  };

  const titles: Record<Step, [string, string]> = {
    email: ["Forgot password", "Enter your email and we'll send you a one-time code"],
    otp: ["Enter OTP", `We sent a 6-digit code to ${email}`],
    reset: ["Set new password", "Choose a new password for your account"],
  };

  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr] lg:grid-rows-1 lg:grid-cols-[30%_70%] bg-white">
      <BrandPanel />

      <main className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{titles[step][0]}</h1>
            <p className="text-sm text-muted-foreground">{titles[step][1]}</p>
          </div>

          {serverError && (
            <Alert variant="destructive">
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          {step === "email" && (
            <form onSubmit={emailForm.handleSubmit(sendOtp)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    autoComplete="email"
                    className="pl-10"
                    {...emailForm.register("email")}
                  />
                </div>
                {emailForm.formState.errors.email && (
                  <p className="text-sm text-destructive">{emailForm.formState.errors.email.message}</p>
                )}
              </div>
              <Button
                type="submit"
                variant="gradient"
                size="lg"
                className="w-full"
                disabled={emailForm.formState.isSubmitting}
              >
                {emailForm.formState.isSubmitting ? "Sending..." : "Send OTP"}
              </Button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={otpForm.handleSubmit(checkOtp)} className="space-y-4">
              {info && <p className="text-sm text-muted-foreground">{info}</p>}
              <div className="space-y-2">
                <Label htmlFor="otp">One-time code</Label>
                <Controller
                  control={otpForm.control}
                  name="otp"
                  render={({ field }) => (
                    <InputOTP id="otp" maxLength={6} value={field.value} onChange={field.onChange}>
                      <InputOTPGroup>
                        {[0, 1, 2, 3, 4, 5].map((i) => (
                          <InputOTPSlot key={i} index={i} />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  )}
                />
                {otpForm.formState.errors.otp && (
                  <p className="text-sm text-destructive">{otpForm.formState.errors.otp.message}</p>
                )}
              </div>
              <Button
                type="submit"
                variant="gradient"
                size="lg"
                className="w-full"
                disabled={otpForm.formState.isSubmitting}
              >
                {otpForm.formState.isSubmitting ? "Verifying..." : "Verify OTP"}
              </Button>
              <div className="flex justify-between text-sm">
                <button type="button" className="text-primary hover:underline" onClick={resendOtp}>
                  Resend OTP
                </button>
                <button
                  type="button"
                  className="text-muted-foreground hover:underline"
                  onClick={() => {
                    setServerError("");
                    setStep("email");
                  }}
                >
                  Change email
                </button>
              </div>
            </form>
          )}

          {step === "reset" && (
            <form onSubmit={resetForm.handleSubmit(submitReset)} className="space-y-4">
              {(["newPassword", "confirmPassword"] as const).map((name) => (
                <div className="space-y-2" key={name}>
                  <Label htmlFor={name}>{name === "newPassword" ? "New password" : "Confirm password"}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id={name}
                      type={showPassword ? "text" : "password"}
                      placeholder={name === "newPassword" ? "Enter new password" : "Re-enter new password"}
                      autoComplete="new-password"
                      className="pl-10 pr-10"
                      {...resetForm.register(name)}
                    />
                    {name === "newPassword" && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    )}
                  </div>
                  {resetForm.formState.errors[name] && (
                    <p className="text-sm text-destructive">{resetForm.formState.errors[name]?.message}</p>
                  )}
                </div>
              ))}
              <Button
                type="submit"
                variant="gradient"
                size="lg"
                className="w-full"
                disabled={resetForm.formState.isSubmitting}
              >
                {resetForm.formState.isSubmitting ? "Resetting..." : "Reset password"}
              </Button>
            </form>
          )}

          <p className="text-center text-sm">
            <Link to="/login" className="text-primary hover:underline">
              Back to sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
