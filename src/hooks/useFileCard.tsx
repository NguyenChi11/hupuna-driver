import { useEffect, useRef, useState } from "react";
import { FileItem, FolderItem } from "@/types/types";
import { isFolder } from "@/utils/fileCard";

export const useFileCard = (item: FileItem | FolderItem) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(item.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  const submitRename = (
    onRename: (id: string, name: string, type: "item" | "folder") => void
  ) => {
    if (editedName.trim() && editedName !== item.name) {
      onRename(item.id, editedName, isFolder(item) ? "folder" : "item");
    }
    setIsEditing(false);
  };

  return {
    isEditing,
    setIsEditing,
    editedName,
    setEditedName,
    inputRef,
    submitRename,
  };
};
