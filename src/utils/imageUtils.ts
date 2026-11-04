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