import { ICONS } from "@/components/constants";
import { getIconByType } from "@/utils/fileCard";

export const FileCardIcon = ({
  type,
  item,
  children,
}: {
  type: string;
  item: any;
  children?: React.ReactNode;
}) => {
  const Icon = getIconByType(type);
  const isMedia = type === "image" || type === "video";

  return (
    <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50">
      {isMedia && item.thumbnail ? (
        <>
          <img
            src={item.thumbnail}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          {type === "video" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/40 rounded-full p-3">
                <ICONS.Play className="w-8 h-8 text-white" />
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center justify-center h-full">
          <Icon className="w-16 h-16 text-gray-400" />
        </div>
      )}

      {/* Actions overlay */}
      <div className="absolute inset-x-0 top-0 p-3 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
        {children}
      </div>
    </div>
  );
};
