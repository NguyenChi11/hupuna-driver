import { ICONS } from "@/components/constants";
import { FileOrFolder } from "@/types/file-card";
import { isFolder } from "@/utils/fileCard";

interface Props {
  item: FileOrFolder;
  onDelete: any;
  onRestore?: any;
  onDownload?: any;
  onEdit: () => void;
}

export const FileCardActions = ({
  item,
  onDelete,
  onRestore,
  onDownload,
  onEdit,
}: Props) => {
  const folder = isFolder(item);

  return (
    <div className="opacity-0 group-hover:opacity-100 flex gap-1">
      {onDownload && !folder && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDownload(item);
          }}
        >
          <ICONS.Download className="w-4 h-4" />
        </button>
      )}
      {onRestore ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRestore(item.id, folder ? "folder" : "item");
          }}
        >
          <ICONS.Restore className="w-4 h-4" />
        </button>
      ) : (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
        >
          <ICONS.Edit className="w-4 h-4" />
        </button>
      )}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(item.id, folder ? "folder" : "item");
        }}
      >
        <ICONS.Trash className="w-4 h-4" />
      </button>
    </div>
  );
};
