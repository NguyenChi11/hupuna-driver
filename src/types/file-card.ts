import { FileItem, FolderItem } from "@/types/types";

export type FileOrFolder = FileItem | FolderItem;

export interface FileCardProps {
  item: FileOrFolder;
  onOpen: (item: unknown) => void;
  onDelete: (id: string, type: "item" | "folder") => void;
  onRename: (id: string, newName: string, type: "item" | "folder") => void;
  onRestore?: (id: string, type: "item" | "folder") => void;
  onDownload?: (item: FileOrFolder) => void;
  isDeleting: boolean;
  isSelected?: boolean;
  onSelect?: (id: string, type: "item" | "folder") => void;
  onToggleStar?: (id: string, type: "item" | "folder") => void;
}
