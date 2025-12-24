"use client";
import { ICONS, STORAGE_KEY } from "@/components/constants";
import AssetModal from "@/components/ui/AssetModal";
import FileCard from "@/components/ui/FileCard";
import FilterBar from "@/components/ui/FilterBar";
import Header from "@/components/ui/Header";
import Sidebar from "@/components/ui/SideBar";
import React from "react";
import { FileItem, FolderItem, ItemType } from "@/types/types";
import { INITIAL_FOLDERS, INITIAL_ITEMS } from "@/data/testData";

const { useEffect, useMemo, useState } = React;
const analyzeFileAI = async (
  fileName: string,
  type: ItemType
): Promise<{ description: string; tags: string[] }> => {
  return { description: "", tags: [] };
};

export default function Home() {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [items, setItems] = useState<FileItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarSection, setSidebarSection] = useState("all");
  const [activeType, setActiveType] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newType, setNewType] = useState<ItemType | "folder">("folder");
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Persistence
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const { folders, items } = JSON.parse(savedData);
      setFolders(folders || []);
      setItems(items || []);
    } else {
      setFolders(INITIAL_FOLDERS);
      setItems(INITIAL_ITEMS);
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ folders: INITIAL_FOLDERS, items: INITIAL_ITEMS })
      );
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ folders, items }));
  }, [folders, items]);

  const breadcrumbs = useMemo(() => {
    const path: FolderItem[] = [];
    let currentId = currentFolderId;
    while (currentId) {
      const folder = folders.find((f) => f.id === currentId);
      if (folder) {
        path.unshift(folder);
        currentId = folder.parentId;
      } else break;
    }
    return path;
  }, [currentFolderId, folders]);

  const sortedAndFilteredItems = useMemo(() => {
    let resultItems: (FileItem | FolderItem)[] = [];

    // Global navigation vs Folder browsing
    if (sidebarSection !== "all") {
      const isGlobal = sidebarSection.startsWith("global:");
      const type = isGlobal ? sidebarSection.slice(7) : sidebarSection;
      const scopeTarget = isGlobal ? "global" : "local";
      if (type === "all") {
        const scopedFolders = folders.filter(
          (f) => (f.scope === "global" ? "global" : "local") === scopeTarget
        );
        const scopedItems = items.filter(
          (i: FileItem) =>
            (i.scope === "global" ? "global" : "local") === scopeTarget
        );
        resultItems = [...scopedFolders, ...scopedItems];
        const typeOrder = ["folder", "image", "video", "link", "file"];
        resultItems.sort((a, b) => {
          const typeA = "type" in a ? a.type : "folder";
          const typeB = "type" in b ? b.type : "folder";
          const orderDiff = typeOrder.indexOf(typeA) - typeOrder.indexOf(typeB);
          if (orderDiff !== 0) return orderDiff;
          return b.createdAt - a.createdAt;
        });
      } else if (type === "folder") {
        resultItems = folders.filter(
          (f) => (f.scope === "global" ? "global" : "local") === scopeTarget
        );
      } else {
        resultItems = items.filter(
          (i) =>
            i.type === (type as ItemType) &&
            (i.scope === "global" ? "global" : "local") === scopeTarget
        );
      }
    } else {
      // "All Files" logic
      const currentFolders = folders.filter(
        (f) =>
          f.parentId === currentFolderId && (f.scope ?? "local") === "local"
      );
      const currentFiles = items.filter(
        (i: FileItem) =>
          i.parentId === currentFolderId && (i.scope ?? "local") === "local"
      );

      // Merge for sorting
      resultItems = [...currentFolders, ...currentFiles];

      // Sorting order: Folder, Image, Video, Link, File
      const typeOrder = ["folder", "image", "video", "link", "file"];
      resultItems.sort((a, b) => {
        const typeA = "type" in a ? a.type : "folder";
        const typeB = "type" in b ? b.type : "folder";
        const orderDiff = typeOrder.indexOf(typeA) - typeOrder.indexOf(typeB);
        if (orderDiff !== 0) return orderDiff;
        return b.createdAt - a.createdAt; // Secondary sort by date
      });
    }

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      resultItems = resultItems.filter(
        (item: FileItem | FolderItem) =>
          item.name.toLowerCase().includes(q) ||
          ("tags" in item &&
            item.tags?.some((t) => t.toLowerCase().includes(q)))
      );
    }

    // Contextual Navigation Filter (Horizontal bar)
    if (activeType !== "all") {
      resultItems = resultItems.filter((item: FileItem | FolderItem) => {
        const itemType = "type" in item ? item.type : "folder";
        return itemType === activeType;
      });
    }

    return resultItems;
  }, [
    currentFolderId,
    folders,
    items,
    sidebarSection,
    searchQuery,
    activeType,
  ]);

  const counts = useMemo(() => {
    const baseItems: (FileItem | FolderItem)[] =
      sidebarSection !== "all"
        ? sortedAndFilteredItems
        : [
            ...folders.filter(
              (f) =>
                f.parentId === currentFolderId &&
                (f.scope ?? "local") === "local"
            ),
            ...items.filter(
              (i: FileItem) =>
                i.parentId === currentFolderId &&
                (i.scope ?? "local") === "local"
            ),
          ];

    return {
      all: baseItems.length,
      folder: baseItems.filter((i) => !("type" in i)).length,
      image: baseItems.filter((i) => "type" in i && i.type === "image").length,
      video: baseItems.filter((i) => "type" in i && i.type === "video").length,
      link: baseItems.filter((i) => "type" in i && i.type === "link").length,
      file: baseItems.filter((i) => "type" in i && i.type === "file").length,
    };
  }, [currentFolderId, folders, items, sidebarSection, sortedAndFilteredItems]);

  const handleCreate = async () => {
    if (newType === "folder" && !newName) return;
    if (newType === "link") {
      if (!newUrl) return; // Must have URL for link
    } else {
      if (newType !== "folder" && !newName && !newUrl && !file) return;
    }

    const isGlobal = sidebarSection.startsWith("global:");
    const scopeTarget: "local" | "global" = isGlobal ? "global" : "local";
    const targetParentId = isGlobal ? null : currentFolderId;

    if (newType === "folder") {
      const newFolder: FolderItem = {
        id: Math.random().toString(36).slice(2, 11),
        name: newName,
        parentId: targetParentId,
        createdAt: Date.now(),
        scope: scopeTarget,
      };
      setFolders((prev) => [...prev, newFolder]);
    } else {
      let finalName = newName;
      if (!finalName) {
        if (newType === "link") {
          finalName = newUrl;
        } else {
          if (file) finalName = file.name;
          else if (newUrl) finalName = newUrl;
          else finalName = "Untitled";
        }
      }

      setIsAnalyzing(true);
      const aiData = await analyzeFileAI(finalName, newType);

      let finalUrl = newUrl;
      // Only use file object URL if NOT a link type (link type uses direct URL)
      if (newType !== "link" && file) {
        finalUrl = URL.createObjectURL(file);
      }

      const newItem: FileItem = {
        id: Math.random().toString(36).substr(2, 9),
        name: finalName,
        type: newType as ItemType,
        parentId: targetParentId,
        createdAt: Date.now(),
        url: finalUrl,
        size: newType !== "link" && file ? file.size : undefined,
        description: aiData.description,
        tags: aiData.tags,
        scope: scopeTarget,
      };
      setItems((prev) => [...prev, newItem]);
      setIsAnalyzing(false);
    }

    setNewName("");
    setNewUrl("");
    setFile(null);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, type: "item" | "folder") => {
    setDeletingId(id);
    setTimeout(() => {
      if (type === "folder")
        setFolders((prev) => prev.filter((f) => f.id !== id));
      else setItems((prev) => prev.filter((i) => i.id !== id));
      setDeletingId(null);
    }, 400);
  };

  const handleRename = (
    id: string,
    newName: string,
    type: "item" | "folder"
  ) => {
    if (type === "folder") {
      setFolders((prev) =>
        prev.map((f) => (f.id === id ? { ...f, name: newName } : f))
      );
    } else {
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, name: newName } : i))
      );
    }
  };

  const handleOpen = (item: FileItem | FolderItem) => {
    if (!("type" in item)) {
      setCurrentFolderId(item.id);
      setSidebarSection("all");
      setActiveType("all");
    } else {
      if (item.url) window.open(item.url, "_blank");
      else
        alert(
          `Opening: ${item.name}\n\nAI Summary: ${
            item.description || "No description"
          }`
        );
    }
  };

  return (
    <div className="flex h-screen bg-[#FDFDFF] overflow-hidden">
      <Sidebar
        currentSection={sidebarSection}
        setSection={(s) => {
          setSidebarSection(s);
          setCurrentFolderId(null);
          setActiveType("all");
        }}
        setSectionGlobal={(s) => {
          setSidebarSection(s);
          setCurrentFolderId(null);
          setActiveType("all");
        }}
      />

      <main className="flex-1 flex flex-col min-w-0 bg-white md:rounded-l-[2.5rem] shadow-2xl relative overflow-hidden">
        <Header onSearch={setSearchQuery} onNew={() => setIsModalOpen(true)} />

        <div className="flex-1 overflow-y-auto no-scrollbar pb-20 px-8">
          <div className="max-w-7xl mx-auto">
            {/* Breadcrumbs & Title */}
            <div className="pt-8">
              <nav className="flex items-center gap-1 text-[0.875rem] font-black text-gray-400 uppercase tracking-widest mb-1">
                <button
                  onClick={() => {
                    setCurrentFolderId(null);
                    setSidebarSection("all");
                  }}
                  className="hover:text-blue-600 transition-colors"
                >
                  My Drive
                </button>
                {breadcrumbs.map((f) => (
                  <React.Fragment key={f.id}>
                    <ICONS.ChevronRight className="w-3 h-3 mx-1" />
                    <button
                      onClick={() => setCurrentFolderId(f.id)}
                      className="hover:text-blue-600 transition-colors truncate max-w-30"
                    >
                      {f.name}
                    </button>
                  </React.Fragment>
                ))}
              </nav>
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-6">
                {sidebarSection !== "all"
                  ? sidebarSection.charAt(0).toUpperCase() +
                    sidebarSection.slice(1)
                  : breadcrumbs[breadcrumbs.length - 1]?.name || "Drive Root"}
              </h1>
            </div>

            {/* Contextual Horizontal Filter */}
            <FilterBar
              activeType={activeType}
              setActiveType={setActiveType}
              counts={counts}
            />

            {/* Content Grid */}
            {(sidebarSection === "all" || sidebarSection === "global:all") &&
            activeType === "all" ? (
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
                      (i: FileItem | FolderItem) =>
                        "type" in i && i.type === "image"
                    ),
                  },
                  {
                    id: "video",
                    label: "Video",
                    icon: ICONS.Video,
                    items: sortedAndFilteredItems.filter(
                      (i: FileItem | FolderItem) =>
                        "type" in i && i.type === "video"
                    ),
                  },
                  {
                    id: "link",
                    label: "Link",
                    icon: ICONS.Link,
                    items: sortedAndFilteredItems.filter(
                      (i: FileItem | FolderItem) =>
                        "type" in i && i.type === "link"
                    ),
                  },
                  {
                    id: "file",
                    label: "Document",
                    icon: ICONS.File,
                    items: sortedAndFilteredItems.filter(
                      (i: FileItem | FolderItem) =>
                        "type" in i && i.type === "file"
                    ),
                  },
                ].map((group) =>
                  group.items.length > 0 ? (
                    <div key={group.id} className="mt-8">
                      <div className="flex items-center gap-2 mb-4">
                        <group.icon className="w-4 h-4 text-gray-400" />
                        <h2 className="text-sm font-black text-gray-500 uppercase tracking-widest">
                          {group.label}
                        </h2>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                        {group.items.map((item: FileItem | FolderItem) => (
                          <FileCard
                            key={item.id}
                            item={item}
                            onOpen={(item: unknown) =>
                              handleOpen(item as FileItem | FolderItem)
                            }
                            onDelete={handleDelete}
                            onRename={handleRename}
                            isDeleting={deletingId === item.id}
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
                    <h3 className="text-xl font-bold text-gray-900">
                      No assets found
                    </h3>
                    <p className="text-sm text-gray-500 max-w-xs mx-auto mt-2">
                      Try changing your filters or add a new asset to this
                      space.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {sortedAndFilteredItems.map((item: FileItem | FolderItem) => (
                  <FileCard
                    key={item.id}
                    item={item}
                    onOpen={(item: unknown) =>
                      handleOpen(item as FileItem | FolderItem)
                    }
                    onDelete={handleDelete}
                    onRename={handleRename}
                    isDeleting={deletingId === item.id}
                  />
                ))}
                {sortedAndFilteredItems.length === 0 && (
                  <div className="col-span-full py-32 flex flex-col items-center justify-center text-center opacity-60">
                    <div className="bg-gray-50 p-8 rounded-[2.5rem] mb-6 border border-gray-100">
                      <ICONS.Cloud className="w-16 h-16 text-gray-200" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                      No assets found
                    </h3>
                    <p className="text-sm text-gray-500 max-w-xs mx-auto mt-2">
                      Try changing your filters or add a new asset to this
                      space.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal for New Asset */}
      {isModalOpen && (
        <AssetModal
          onClose={() => setIsModalOpen(false)}
          newType={newType}
          setNewType={setNewType}
          newName={newName}
          setNewName={setNewName}
          newUrl={newUrl}
          setNewUrl={setNewUrl}
          file={file}
          setFile={setFile}
          isAnalyzing={isAnalyzing}
          handleCreate={handleCreate}
        />
      )}
    </div>
  );
}
