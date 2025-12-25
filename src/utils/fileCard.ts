import { FileItem, FolderItem } from "@/types/types";
import { ICONS } from "@/components/constants";

export const isFolder = (item: FileItem | FolderItem) => !("type" in item);

export const getItemType = (item: FileItem | FolderItem) =>
  isFolder(item) ? "folder" : item.type;

export const getIconByType = (type: string) => {
  switch (type) {
    case "folder":
      return ICONS.Folder;
    case "video":
      return ICONS.Video;
    case "image":
      return ICONS.Image;
    case "link":
      return ICONS.Link;
    default:
      return ICONS.File;
  }
};

export const getColorClasses = (type: string) => {
  switch (type) {
    case "folder":
      return "text-blue-600 bg-blue-50 border-blue-100 hover:border-blue-200";
    case "video":
      return "text-purple-600 bg-purple-50 border-purple-100 hover:border-purple-200";
    case "image":
      return "text-rose-600 bg-rose-50 border-rose-100 hover:border-rose-200";
    case "link":
      return "text-amber-600 bg-amber-50 border-amber-100 hover:border-amber-200";
    default:
      return "text-emerald-600 bg-emerald-50 border-emerald-100 hover:border-emerald-200";
  }
};
