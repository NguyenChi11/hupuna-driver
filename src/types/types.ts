export type ItemType = "folder" | "file" | "video" | "image" | "link";

export interface FileItem {
  id: string;
  name: string;
  type: ItemType;
  parentId: string | null;
  createdAt: number;
  size?: number; // bytes
  url?: string;
  thumbnail?: string;
  description?: string;
  tags?: string[];
  scope?: "local" | "global";
  trashedAt?: number;
  starred?: boolean;
  authorId?: string;
  authorName?: string;
  authorAvatar?: string;
}

export interface FolderItem {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: number;
  children?: FolderItem[];
  scope?: "local" | "global";
  trashedAt?: number;
  starred?: boolean;
  authorId?: string;
  authorName?: string;
  authorAvatar?: string;
}

export interface FileSystemState {
  items: FileItem[];
  folders: FolderItem[];
}
