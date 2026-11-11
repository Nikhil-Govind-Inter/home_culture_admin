import type { FieldValues, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ZodTypeAny } from "zod";

const VIDEO_EXT = /\.(mp4|webm)$/i;
const IMAGE_EXT = /\.(jpe?g|png|webp|gif)$/i;

export const hasFile = (v: unknown) =>
  v instanceof File || (typeof v === "string" && v.trim().length > 0);

export const missingFileError = (value: unknown, label: string) =>
  hasFile(value) ? undefined : `${label} is required`;

// A selected File (mime type) or stored path (extension) must match the chosen media type.
export const mediaMatchError = (value: unknown, type: string, label: string) => {
  if (!hasFile(value)) return undefined;
  const wantVideo = type === "video";
  const ok =
    value instanceof File
      ? value.type.startsWith(wantVideo ? "video/" : "image/")
      : (wantVideo ? VIDEO_EXT : IMAGE_EXT).test(String(value).split("?")[0]);
  if (ok) return undefined;
  return wantVideo
    ? `${label} must be a valid video file (mp4 or webm)`
    : `${label} must be a valid image file (jpg, png, webp or gif)`;
};

// zod skips refinements while a base field is invalid, so the media-type dependent errors
// are merged into the resolver result to show up together with the other field errors.
export function buildMediaResolver<T extends FieldValues>(
  schema: ZodTypeAny,
  conditionalErrors: (values: T) => Partial<Record<keyof T, string>>,
): Resolver<T> {
  return async (values, context, options) => {
    const result = await zodResolver(schema)(values, context, options);
    const extra = conditionalErrors(values);
    const keys = Object.keys(extra) as (keyof T)[];
    if (!keys.length) return result as never;
    const errors: Record<string, unknown> = { ...result.errors };
    keys.forEach((k) => {
      errors[k as string] = { type: "required", message: extra[k] };
    });
    return { values: {}, errors } as never;
  };
}
