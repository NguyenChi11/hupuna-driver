export const isMediaType = (type: string) =>
  type.startsWith("image/") || type.startsWith("video/");
