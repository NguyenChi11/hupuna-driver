import React from "react";
import { ICONS } from "@/components/constants";
import Image from "next/image";

const ICON_COMPONENTS = {
  folder: ICONS.Folder,
  video: ICONS.Video,
  image: ICONS.Image,
  link: ICONS.Link,
  file: ICONS.File,
} as const;

export const FileCardIcon = ({
  type,
  item,
  children,
}: {
  type: string;
  item: {
    name: string;
    url?: string;
    thumbnail?: string;
  };
  children?: React.ReactNode;
}) => {
  const Icon =
    ICON_COMPONENTS[(type as keyof typeof ICON_COMPONENTS) || "file"] ||
    ICON_COMPONENTS.file;
  const isMedia = type === "image" || type === "video";

  return (
    <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50">
      {isMedia && type === "image" && (item.thumbnail || item.url) ? (
        <>
          <Image
            width={200}
            height={200}
            src={item.thumbnail || item.url!}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </>
      ) : isMedia && type === "video" && item.url ? (
        <video
          src={item.url}
          className="w-full h-full object-cover"
          muted
          playsInline
          preload="metadata"
        />
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
