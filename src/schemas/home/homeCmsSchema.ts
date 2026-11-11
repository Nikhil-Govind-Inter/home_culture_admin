import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

const short = commonValidations.requiredString;
const text = commonValidations.requiredText;
const file = commonValidations.requiredFile;
const mediaType = z.enum(["image", "video"]);

// Every field is required, except thumbnails which are only needed for video media.
const homeCmsBase = z.object({
  // Section One - Challenges
  challenges_section_status: z.boolean(),
  challenges_section_header_title: short("Header title"),
  challenges_section_title: short("Title"),
  challenges_section_description: text("Description"),
  challenges_section_right_title: short("Right title"),
  challenges_section_button_text: short("Button text"),
  challenges_section_button_link: short("Button link"),

  // Section Two - Ownership
  ownership_status: z.boolean(),
  ownership_media_type: mediaType,
  ownership_desktop_media_path: file("Desktop media"),
  ownership_mobile_media_path: z.any().optional(),
  ownership_mobile_media_alt: short("Media alt text"),
  ownership_thumbnail: z.any().optional(),
  ownership_header_title: short("Header title"),
  ownership_title: short("Title"),
  ownership_description: text("Description"),
  ownership_choose_title: short("Choose title"),
  ownership_button_text: short("Button text"),
  ownership_button_link: short("Button link"),

  // Section Three - Welcome
  welcome_section_status: z.boolean(),
  welcome_section_header_title: short("Header title"),
  welcome_section_title: short("Title"),
  welcome_section_description: text("Description"),

  // Section Four - Style
  style_section_status: z.boolean(),
  style_section_title: short("Title"),

  // Section Five - Experience
  experience_section_status: z.boolean(),
  experience_section_header_title: short("Header title"),
  experience_section_title: short("Title"),
  modal_title: short("Modal title"),
  modal_description: text("Modal description"),
  button_one_text: short("Button one text"),
  button_one_link: short("Button one link"),
  button_two_text: short("Button two text"),
  phone: short("Phone"),
  whatsapp_number: short("WhatsApp number"),

  // Section Six - Journey
  journey_section_status: z.boolean(),
  journey_section_header_title: short("Header title"),
  journey_section_title: short("Title"),
  journey_section_media_type: mediaType,
  journey_section_desktop_media_path: file("Desktop media"),
  journey_section_mobile_media_path: z.any().optional(),
  journey_section_media_alt: short("Media alt text"),
  journey_section_thumbnail: z.any().optional(),
  journey_section_description: text("Description"),
  journey_section_button_text: short("Button text"),
  journey_section_button_link: short("Button link"),

  // Section Seven - Insights
  insights_status: z.boolean(),
  insights_header_title: short("Header title"),
  insights_title: short("Title"),
  insights_description: text("Description"),
  insights_button_text: short("Button text"),
  insights_button_link: short("Button link"),

  // Section Eight - CTA
  cta_status: z.boolean(),
  cta_desktop_media_path: file("Desktop image"),
  cta_mobile_media_path: file("Mobile image"),
  cta_media_alt: short("Image alt text"),
  cta_header_title: short("Header title"),
  cta_title: short("Title"),
  cta_description: text("Description"),
  cta_button_one_text: short("Button one text"),
  cta_button_one_link: short("Button one link"),
  cta_button_two_text: short("Button two text"),
  cta_button_two_link: short("Button two link"),
});

const hasFile = (v: unknown) =>
  v instanceof File || (typeof v === "string" && v.trim().length > 0);

// Plain object schema: the media-type dependent checks live in `homeCmsConditionalErrors`
// so they are reported together with the other field errors (zod skips superRefine
// while any base field is invalid).
export const homeCmsSchema = homeCmsBase;

type Values = z.infer<typeof homeCmsBase>;

export const homeCmsConditionalErrors = (data: Values) => {
  const errors: Partial<Record<keyof Values, string>> = {};
  const VIDEO_EXT = /\.(mp4|webm)$/i;
  const IMAGE_EXT = /\.(jpe?g|png|webp|gif)$/i;
  // Desktop media must match the chosen media type (File mime type, or stored path extension).
  const checkDesktop = (
    type: "ownership_media_type" | "journey_section_media_type",
    desktop: "ownership_desktop_media_path" | "journey_section_desktop_media_path",
  ) => {
    const value = data[desktop];
    if (!hasFile(value)) return;
    const wantVideo = data[type] === "video";
    const ok =
      value instanceof File
        ? value.type.startsWith(wantVideo ? "video/" : "image/")
        : (wantVideo ? VIDEO_EXT : IMAGE_EXT).test(String(value).split("?")[0]);
    if (!ok) errors[desktop] = wantVideo
        ? "Desktop video must be a valid video file (mp4 or webm)"
        : "Desktop image must be a valid image file (jpg, png, webp or gif)";
  };
  checkDesktop("ownership_media_type", "ownership_desktop_media_path");
  checkDesktop("journey_section_media_type", "journey_section_desktop_media_path");

  const check = (
    type: "ownership_media_type" | "journey_section_media_type",
    mobile: "ownership_mobile_media_path" | "journey_section_mobile_media_path",
    thumb: "ownership_thumbnail" | "journey_section_thumbnail",
  ) => {
    if (data[type] === "video") {
      if (!hasFile(data[thumb])) errors[thumb] = "Thumbnail is required";
    } else if (!hasFile(data[mobile])) {
      errors[mobile] = "Mobile image is required";
    }
  };
  check("ownership_media_type", "ownership_mobile_media_path", "ownership_thumbnail");
  check("journey_section_media_type", "journey_section_mobile_media_path", "journey_section_thumbnail");
  return errors;
};

export type HomeCmsFormData = z.infer<typeof homeCmsBase>;
