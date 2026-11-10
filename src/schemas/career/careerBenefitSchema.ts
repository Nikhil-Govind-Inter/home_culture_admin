import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const careerBenefitSchema = z.object({
  media_path: commonValidations.requiredFile("Image").refine(
    (val) => !(val instanceof File) || (val.type === "image/svg+xml" && val.name.toLowerCase().endsWith(".svg")),
    { message: "Only SVG images are allowed" },
  ),
  title: commonValidations.requiredString("Title"),
  description: commonValidations.requiredText("Description"),
  sort_order: commonValidations.sortOrder,
  status: commonValidations.booleanStatus,
});

export type CareerBenefitFormData = z.infer<typeof careerBenefitSchema>;
