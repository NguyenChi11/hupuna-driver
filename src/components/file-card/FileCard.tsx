"use client";

import { FileCardProps } from "@/types/file-card";
import { getItemType, getColorClasses, isFolder } from "@/utils/fileCard";
import { useFileCard } from "@/hooks/useFileCard";
import { FileCardIcon } from "./FileCardIcon";
import { FileCardActions } from "./FileCardActions";
import { FileCardTitle } from "./FileCardTitle";
import FileCardSelect from "./FileCardSelect";

const FileCard = ({
  item,
  onOpen,
  onDelete,
  onRename,
  onRestore,
  onDownload,
  isDeleting,
  isSelected,
  onSelect,
}: FileCardProps) => {
  const type = getItemType(item);
  const color = getColorClasses(type);

  const {
    isEditing,
    setIsEditing,
    editedName,
    setEditedName,
    inputRef,
    submitRename,
  } = useFileCard(item);

  return (
    <div
      data-id={item.id}
      onClick={(e) => {
        if ((e.ctrlKey || e.shiftKey) && onSelect) {
          onSelect(item.id, isFolder(item) ? "folder" : "item");
        } else {
          onOpen(item);
        }
      }}
      className={`group relative rounded-3xl p-5 ${color}`}
    >
      {onSelect && (
        <FileCardSelect
          isSelected={isSelected}
          className={
            isSelected
              ? "opacity-100"
              : "opacity-0 group-hover:opacity-100 transition-opacity"
          }
          onClick={(e) => {
            e.stopPropagation();
            onSelect(item.id, isFolder(item) ? "folder" : "item");
          }}
        />
      )}

      <FileCardIcon type={type}>
        <FileCardActions
          item={item}
          onDelete={onDelete}
          onRestore={onRestore}
          onDownload={onDownload}
          onEdit={() => setIsEditing(true)}
        />
      </FileCardIcon>

      <FileCardTitle
        item={item}
        isEditing={isEditing}
        editedName={editedName}
        setEditedName={setEditedName}
        inputRef={inputRef}
        onSubmit={() => submitRename(onRename)}
      />

      {isDeleting && <div className="absolute inset-0 bg-white/60" />}
    </div>
  );
};

export default FileCard;
