import { resolveImageUrl } from "@/lib/resolveImageUrl";

interface MediaThumbnailProps {
  path: string | null | undefined;
  alt?: string | null;
}

// Shared table-cell thumbnail used by every listing page with a media/icon
// column (banners, milestones, social media, footer media, ads banners) so
// the sizing/placeholder/URL-resolution stays consistent in one place.
export default function MediaThumbnail({ path, alt }: MediaThumbnailProps) {
  const src = resolveImageUrl(path);

  return (
    <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center overflow-hidden">
      {src ? (
        <img
          src={src}
          alt={alt || ""}
          loading="lazy"
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-8 h-8 rounded bg-muted-foreground/20" />
      )}
    </div>
  );
}
