import { ICONS } from "@/components/constants";
import { AssetTypeSelectorProps } from "@/types/asset";

export const AssetTypeSelector = ({
  newType,
  setNewType,
}: AssetTypeSelectorProps) => {
  const types = [
    { id: "folder", icon: ICONS.Folder, label: "FOLDER" },
    { id: "media", icon: ICONS.Image, label: "MEDIA" },
    { id: "link", icon: ICONS.Link, label: "LINK" },
    { id: "file", icon: ICONS.File, label: "FILE" },
  ] as const;

  return (
    <div className="grid grid-cols-3 gap-2">
      {types.map((t) => {
        const active =
          t.id === "media"
            ? newType === "image" || newType === "video"
            : newType === t.id;

        return (
          <button
            key={t.id}
            onClick={() => setNewType(t.id === "media" ? "image" : t.id)}
            className={`rounded-2xl py-3 border-2 ${
              active ? "bg-blue-600 text-white" : "border-gray-100"
            }`}
          >
            <t.icon className="w-5 h-5 mx-auto" />
            <span className="text-xs font-bold">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
};
