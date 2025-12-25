"use client";

import { FileCardProps } from "@/types/file-card";
import { getItemType, isFolder } from "@/utils/fileCard";
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
  onToggleStar,
}: FileCardProps) => {
  const type = getItemType(item);

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
        if ((e.ctrlKey || e.metaKey || e.shiftKey) && onSelect) {
          onSelect(item.id, isFolder(item) ? "folder" : "item");
        } else if (!isEditing) {
          onOpen(item);
        }
      }}
      className={`
        group relative bg-white rounded-2xl border border-transparent
        hover:border-gray-300 hover:shadow-lg transition-all duration-200
        ${isSelected ? "ring-2 ring-blue-500 border-blue-500 shadow-md" : ""}
        ${isDeleting ? "opacity-60" : ""}
      `}
    >
      {/* Checkbox chọn */}
      {onSelect && (
        <FileCardSelect
          isSelected={isSelected}
          className="absolute top-3 left-3 z-10"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(item.id, isFolder(item) ? "folder" : "item");
          }}
        />
      )}

      {/* Thumbnail / Icon area */}
      <FileCardIcon type={type} item={item}>
        <FileCardActions
          item={item}
          onDelete={onDelete}
          onRestore={onRestore}
          onDownload={onDownload}
          onEdit={() => setIsEditing(true)}
          onToggleStar={onToggleStar}
        />
      </FileCardIcon>

      {/* Title */}
      <div className="px-4 pb-4 mt-3">
        <FileCardTitle
          item={item}
          isEditing={isEditing}
          editedName={editedName}
          setEditedName={setEditedName}
          inputRef={inputRef}
          onSubmit={() => submitRename(onRename)}
        />
      </div>

      {/* Overlay khi đang xóa */}
      {isDeleting && (
        <div className="absolute inset-0 bg-white/70 rounded-2xl" />
      )}
    </div>
  );
};

export default FileCard;
