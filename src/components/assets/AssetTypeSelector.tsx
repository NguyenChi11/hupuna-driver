import { ICONS } from "@/components/constants";
import { AssetTypeSelectorProps } from "@/types/asset";

export const AssetTypeSelector = ({
  newType,
  setNewType,
}: AssetTypeSelectorProps) => {
  const types = [
    { id: "folder", icon: ICONS.Folder, label: "Folder" },
    { id: "media", icon: ICONS.Image, label: "Media" },
    { id: "link", icon: ICONS.Link, label: "Link" },
    { id: "file", icon: ICONS.File, label: "File" },
  ] as const;

  return (
    <div className="grid grid-cols-4 gap-3">
      {types.map((t) => {
        const active =
          t.id === "media"
            ? newType === "image" || newType === "video"
            : newType === t.id;

        return (
          <button
            key={t.id}
            onClick={() => setNewType(t.id === "media" ? "image" : t.id)}
            className={`cursor-pointer flex flex-col items-center gap-3 py-6 px-4 rounded-2xl border-2 transition-all ${
              active
                ? "bg-blue-50 border-blue-300 text-blue-700 shadow-sm"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            <t.icon className="w-8 h-8" />
            <span className="text-sm font-medium">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
};
