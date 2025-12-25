import React from "react";
import { ICONS } from "@/components/constants";
import FileCard from "@/components/file-card/FileCard";
import { FileItem, FolderItem } from "@/types/types";

interface DriveContentProps {
  sidebarSection: string;
  activeType: string;
  sortedAndFilteredItems: (FileItem | FolderItem)[];
  deletingId: string | null;
  selectedItems: Set<string>;
  isSelectionMode: boolean;
  onSelect: (id: string) => void;
  onOpen: (item: FileItem | FolderItem) => void;
  onDelete: (id: string, type: "item" | "folder") => void;
  onRename: (id: string, newName: string, type: "item" | "folder") => void;
  onDownload: (item: FileItem | FolderItem) => void;
  onRestore: (id: string, type: "item" | "folder") => void;
}

export default function DriveContent({
  sidebarSection,
  activeType,
  sortedAndFilteredItems,
  deletingId,
  selectedItems,
  isSelectionMode,
  onSelect,
  onOpen,
  onDelete,
  onRename,
  onDownload,
  onRestore,
}: DriveContentProps) {
  if (
    (sidebarSection === "all" || sidebarSection === "global:all") &&
    activeType === "all"
  ) {
    return (
      <>
        {[
          {
            id: "folder",
            label: "Thư mục",
            icon: ICONS.Folder,
            items: sortedAndFilteredItems.filter(
              (i: FileItem | FolderItem) => !("type" in i)
            ),
          },
          {
            id: "image",
            label: "Ảnh",
            icon: ICONS.Image,
            items: sortedAndFilteredItems.filter(
              (i: FileItem | FolderItem) => "type" in i && i.type === "image"
            ),
          },
          {
            id: "video",
            label: "Video",
            icon: ICONS.Video,
            items: sortedAndFilteredItems.filter(
              (i: FileItem | FolderItem) => "type" in i && i.type === "video"
            ),
          },
          {
            id: "link",
            label: "Link",
            icon: ICONS.Link,
            items: sortedAndFilteredItems.filter(
              (i: FileItem | FolderItem) => "type" in i && i.type === "link"
            ),
          },
          {
            id: "file",
            label: "Document",
            icon: ICONS.File,
            items: sortedAndFilteredItems.filter(
              (i: FileItem | FolderItem) => "type" in i && i.type === "file"
            ),
          },
        ].map((group) =>
          group.items.length > 0 ? (
            <div key={group.id} className="mt-8">
              <div className="flex items-center gap-3 mb-5">
                {group.icon && <group.icon className="w-5 h-5 text-gray-500" />}
                <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {group.label}
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {group.items.map((item: FileItem | FolderItem) => (
                  <FileCard
                    key={item.id}
                    item={item}
                    onOpen={(item: unknown) => {
                      if (isSelectionMode) {
                        onSelect((item as FileItem | FolderItem).id);
                      } else {
                        onOpen(item as FileItem | FolderItem);
                      }
                    }}
                    onDelete={onDelete}
                    onRename={onRename}
                    onDownload={onDownload}
                    isDeleting={deletingId === item.id}
                    isSelected={selectedItems.has(item.id)}
                    onSelect={() => onSelect(item.id)}
                  />
                ))}
              </div>
            </div>
          ) : null
        )}
        {sortedAndFilteredItems.length === 0 && (
          <div className="col-span-full py-32 flex flex-col items-center justify-center text-center opacity-60">
            <div className="bg-gray-50 p-8 rounded-[2.5rem] mb-6 border border-gray-100">
              <ICONS.Cloud className="w-16 h-16 text-gray-200" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">No assets found</h3>
            <p className="text-sm text-gray-500 max-w-xs mx-auto mt-2">
              Try changing your filters or add a new asset to this space.
            </p>
          </div>
        )}
      </>
    );
  } else if (sidebarSection === "trash") {
    const localItems = sortedAndFilteredItems.filter(
      (i) => (i.scope ?? "local") === "local"
    );
    const globalItems = sortedAndFilteredItems.filter(
      (i) => i.scope === "global"
    );

    if (localItems.length === 0 && globalItems.length === 0) {
      return (
        <div className="col-span-full py-32 flex flex-col items-center justify-center text-center opacity-60">
          <div className="bg-gray-50 p-8 rounded-[2.5rem] mb-6 border border-gray-100">
            <ICONS.Cloud className="w-16 h-16 text-gray-200" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">No assets found</h3>
          <p className="text-sm text-gray-500 max-w-xs mx-auto mt-2">
            Trash is empty.
          </p>
        </div>
      );
    }

    return (
      <>
        {localItems.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-4">
              <ICONS.Folder className="w-4 h-4 text-gray-400" />
              <h2 className="text-sm font-black text-gray-500 uppercase tracking-widest">
                Folder
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {localItems.map((item) => (
                <FileCard
                  key={item.id}
                  item={item}
                  onOpen={(item: unknown) => {
                    if (isSelectionMode) {
                      onSelect((item as FileItem | FolderItem).id);
                    } else {
                      onOpen(item as FileItem | FolderItem);
                    }
                  }}
                  onDelete={onDelete}
                  onRename={onRename}
                  onRestore={onRestore}
                  onDownload={onDownload}
                  isDeleting={deletingId === item.id}
                  isSelected={selectedItems.has(item.id)}
                  onSelect={() => onSelect(item.id)}
                />
              ))}
            </div>
          </div>
        )}

        {globalItems.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-4">
              <ICONS.Folder className="w-4 h-4 text-gray-400" />
              <h2 className="text-sm font-black text-gray-500 uppercase tracking-widest">
                Folder Global
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {globalItems.map((item) => (
                <FileCard
                  key={item.id}
                  item={item}
                  onOpen={(item: unknown) => {
                    if (isSelectionMode) {
                      onSelect((item as FileItem | FolderItem).id);
                    } else {
                      onOpen(item as FileItem | FolderItem);
                    }
                  }}
                  onDelete={onDelete}
                  onRename={onRename}
                  onRestore={onRestore}
                  onDownload={onDownload}
                  isDeleting={deletingId === item.id}
                  isSelected={selectedItems.has(item.id)}
                  onSelect={
                    isSelectionMode ? () => onSelect(item.id) : undefined
                  }
                />
              ))}
            </div>
          </div>
        )}
      </>
    );
  } else {
    return (
      <>
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {sidebarSection.charAt(0).toUpperCase() + sidebarSection.slice(1)}
          </h2>
          <span className="px-2 py-0.5 rounded-full bg-gray-100 text-xs font-bold text-gray-500">
            {sortedAndFilteredItems.length}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {sortedAndFilteredItems.map((item: FileItem | FolderItem) => (
            <FileCard
              key={item.id}
              item={item}
              onOpen={(item: unknown) => {
                if (isSelectionMode) {
                  onSelect((item as FileItem | FolderItem).id);
                } else {
                  onOpen(item as FileItem | FolderItem);
                }
              }}
              onDelete={onDelete}
              onRename={onRename}
              onDownload={onDownload}
              isDeleting={deletingId === item.id}
              isSelected={selectedItems.has(item.id)}
              onSelect={isSelectionMode ? () => onSelect(item.id) : undefined}
            />
          ))}
        </div>
        {sortedAndFilteredItems.length === 0 && (
          <div className="col-span-full py-32 flex flex-col items-center justify-center text-center opacity-60">
            <div className="bg-gray-50 p-8 rounded-[2.5rem] mb-6 border border-gray-100">
              <ICONS.Cloud className="w-16 h-16 text-gray-200" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">No assets found</h3>
            <p className="text-sm text-gray-500 max-w-xs mx-auto mt-2">
              Try changing your filters or add a new asset to this space.
            </p>
          </div>
        )}
      </>
    );
  }
}
