import React from "react";
import { FileItem, FolderItem } from "@/types/types";

export const FileCardTitle = ({
  item,
  isEditing,
  editedName,
  setEditedName,
  inputRef,
  onSubmit,
}: {
  item: FileItem | FolderItem;
  isEditing: boolean;
  editedName: string;
  setEditedName: (v: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onSubmit: () => void;
}) => {
  if (isEditing) {
    return (
      <input
        ref={inputRef}
        value={editedName}
        onChange={(e) => setEditedName(e.target.value)}
        onBlur={onSubmit}
        onKeyDown={(e) => e.key === "Enter" && onSubmit()}
        className="w-full px-2 py-1 text-sm font-medium bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        autoFocus
      />
    );
  }

  return (
    <h3 className="text-sm font-medium text-gray-900 truncate">
      {item.name || "Untitled"}
    </h3>
  );
};
