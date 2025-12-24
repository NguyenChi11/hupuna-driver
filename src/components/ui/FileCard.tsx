import React, { useMemo } from "react";
import { FileItem, FolderItem } from "@/types/types";
import { ICONS } from "@/components/constants";

interface FileCardProps {
  item: FileItem | FolderItem;
  onOpen: (item: unknown) => void;
  onDelete: (id: string, type: "item" | "folder") => void;
  onRename: (id: string, newName: string, type: "item" | "folder") => void;
  isDeleting: boolean;
}

const FileCard: React.FC<FileCardProps> = ({
  item,
  onOpen,
  onDelete,
  onRename,
  isDeleting,
}) => {
  const isFolder = !("type" in item);
  const type = isFolder ? "folder" : (item as FileItem).type;
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedName, setEditedName] = React.useState(item.name);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleRenameSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (editedName.trim() && editedName !== item.name) {
      onRename(item.id, editedName, isFolder ? "folder" : "item");
    }
    setIsEditing(false);
  };

  const Icon = useMemo(() => {
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
  }, [type]);

  const colorClasses = useMemo(() => {
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
  }, [type]);

  const bgStyles = colorClasses.split(" ").slice(0, 2).join(" ");
  const displayTitle = useMemo(() => {
    if (isFolder) return item.name;
    const fileItem = item as FileItem;
    const name = (item.name || "").trim();
    if (type === "image") {
      const url = (fileItem.url || "").trim();
      const fromUrl = url
        ? decodeURIComponent(url.split("?")[0]).split("/").pop() || ""
        : "";
      if (!name) return fromUrl || "Untitled";
      if (name.startsWith("http://") || name.startsWith("https://")) {
        return fromUrl || name;
      }
      return name;
    }
    return name || "Untitled";
  }, [isFolder, item, type]);

  return (
    <div
      onClick={() => onOpen(item)}
      className={`group relative bg-white border border-gray-100 rounded-3xl p-5 transition-all cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1 ${colorClasses}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={`p-4 rounded-2xl transition-transform group-hover:scale-105 duration-300 ${bgStyles}`}
        >
          <Icon className="w-8 h-8" />
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditedName(item.name);
              setIsEditing(true);
            }}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
          >
            <ICONS.Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item.id, isFolder ? "folder" : "item");
            }}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <ICONS.Trash className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div>
        {isEditing ? (
          <form
            onSubmit={handleRenameSubmit}
            onClick={(e) => e.stopPropagation()}
          >
            <input
              ref={inputRef}
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onBlur={() => handleRenameSubmit()}
              className="w-full font-bold text-gray-900 text-sm mb-1 bg-gray-50 border border-blue-200 rounded px-1 outline-none focus:ring-2 focus:ring-blue-100"
            />
          </form>
        ) : (
          <h3 className="font-bold text-gray-900 text-sm mb-1 truncate leading-tight">
            {displayTitle}
          </h3>
        )}
        <p className="text-[0.875rem] text-gray-400 font-bold uppercase tracking-widest">
          {isFolder ? "Folder" : (item as FileItem).type} •{" "}
          {new Date(item.createdAt).toLocaleDateString()}
        </p>
        {!isFolder && (item as FileItem).description && (
          <p className="mt-2 text-[0.875rem] text-gray-500 line-clamp-2 italic leading-relaxed border-t border-gray-50 pt-2">
            {(item as FileItem).description}
          </p>
        )}
      </div>
      {isDeleting && (
        <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-3xl backdrop-blur-[0.0625rem]">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
};

export default FileCard;
