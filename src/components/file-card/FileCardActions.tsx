import { ICONS } from "@/components/constants";
import { FileOrFolder } from "@/types/file-card";
import { isFolder } from "@/utils/fileCard";

interface Props {
  item: FileOrFolder;
  onDelete: any;
  onRestore?: any;
  onDownload?: any;
  onEdit: () => void;
  onToggleStar?: (id: string, type: "item" | "folder") => void;
}

export const FileCardActions = ({
  item,
  onDelete,
  onRestore,
  onDownload,
  onEdit,
  onToggleStar,
}: Props) => {
  const folder = isFolder(item);
  const starred = "starred" in item && !!item.starred;

  return (
    <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 shadow-md">
      {onToggleStar && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleStar(item.id, folder ? "folder" : "item");
          }}
          className={`p-2 rounded-full transition ${
            starred ? "bg-yellow-100 hover:bg-yellow-200" : "hover:bg-gray-100"
          }`}
          title={starred ? "Unstar" : "Star"}
        >
          <ICONS.Star
            className={`w-4 h-4 ${
              starred ? "text-yellow-600" : "text-gray-700"
            }`}
          />
        </button>
      )}
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
