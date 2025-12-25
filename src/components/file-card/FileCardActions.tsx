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
    <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 shadow-md">
      {onDownload && !folder && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDownload(item);
          }}
          className="p-2 rounded-full hover:bg-gray-100 transition"
          title="Download"
        >
          <ICONS.Download className="w-4 h-4 text-gray-700" />
        </button>
      )}

      {onRestore ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRestore(item.id, folder ? "folder" : "item");
          }}
          className="p-2 rounded-full hover:bg-gray-100 transition"
          title="Restore"
        >
          <ICONS.Restore className="w-4 h-4 text-gray-700" />
        </button>
      ) : (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="p-2 rounded-full hover:bg-gray-100 transition"
          title="Rename"
        >
          <ICONS.Edit className="w-4 h-4 text-gray-700" />
        </button>
      )}

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(item.id, folder ? "folder" : "item");
        }}
        className="p-2 rounded-full hover:bg-gray-100 transition"
        title="Delete"
      >
        <ICONS.Trash className="w-4 h-4 text-gray-700" />
      </button>
    </div>
  );
};
