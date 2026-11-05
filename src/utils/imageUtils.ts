// Image and file utilities
export const formatFileSize = (bytes: number): string => {
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${Math.round(mb)}MB` : `${Math.round(bytes / 1024)}KB`;
};

export const generatePlaceholderWithSizes = (
  accept: string,
  maxImageSize: number,
  maxVideoSize: number,
  basePlaceholder: string = "Drop files here or click to browse"
): string => {
  const acceptsImages = accept.includes("image");
  const acceptsVideos = accept.includes("video");
  
  if (acceptsImages && acceptsVideos) {
    return `${basePlaceholder} (images: max ${formatFileSize(maxImageSize)}, videos: max ${formatFileSize(maxVideoSize)})`;
  } else if (acceptsImages) {
    return `${basePlaceholder} (max ${formatFileSize(maxImageSize)})`;
  } else if (acceptsVideos) {
    return `${basePlaceholder} (max ${formatFileSize(maxVideoSize)})`;
  }
  
  return basePlaceholder;
};
// "1920×600px" -> { width: 1920, height: 600 }
export const parseDimensions = (
  value?: string
): { width: number; height: number } | null => {
  const match = value?.match(/(\d+)\s*[×xX]\s*(\d+)/);
  if (!match) return null;
  const width = Number(match[1]);
  const height = Number(match[2]);
  return width > 0 && height > 0 ? { width, height } : null;
};
