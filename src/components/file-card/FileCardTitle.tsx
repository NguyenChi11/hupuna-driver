import { FileItem, FolderItem } from "@/types/types";
import { isFolder } from "@/utils/fileCard";

export const FileCardTitle = ({
  item,
  isEditing,
  editedName,
  setEditedName,
  inputRef,
  onSubmit,
}: any) => {
  if (isEditing) {
    return (
      <input
        ref={inputRef}
        value={editedName}
        onChange={(e) => setEditedName(e.target.value)}
        onBlur={onSubmit}
        className="w-full font-bold text-sm"
      />
    );
  }

  return (
    <h3 className="font-bold text-sm truncate">{item.name || "Untitled"}</h3>
  );
};
