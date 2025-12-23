"use client";
import { ICONS, STORAGE_KEY } from "@/components/constants";
import AssetModal from "@/components/ui/AssetModal";
import FileCard from "@/components/ui/FileCard";
import FilterBar from "@/components/ui/FilterBar";
import Header from "@/components/ui/Header";
import Sidebar from "@/components/ui/SideBar";
import Image from "next/image";
import React from "react";
const { useEffect, useMemo, useState } = React;
import { FileItem, FolderItem, ItemType } from "@/types/types";
import { INITIAL_FOLDERS, INITIAL_ITEMS } from "@/data/testData";
const analyzeFileAI = async (
  fileName: string,
  type: string
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
      const type = sidebarSection;
      if (type === "folder") {
        resultItems = folders;
      } else {
        resultItems = items.filter((i) => i.type === type);
      }
    } else {
      // "All Files" logic
      const currentFolders = folders.filter(
        (f) => f.parentId === currentFolderId
      );
      const currentFiles = items.filter((i) => i.parentId === currentFolderId);

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
        (item) =>
          item.name.toLowerCase().includes(q) ||
          ("tags" in item &&
            item.tags?.some((t) => t.toLowerCase().includes(q)))
      );
    }

    // Contextual Navigation Filter (Horizontal bar)
    if (activeType !== "all") {
      resultItems = resultItems.filter((item) => {
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
    const baseItems =
      sidebarSection !== "all"
        ? sortedAndFilteredItems
        : [
            ...folders.filter((f) => f.parentId === currentFolderId),
            ...items.filter((i) => i.parentId === currentFolderId),
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
    if (!newName) return;

    if (newType === "folder") {
      const newFolder: FolderItem = {
        id: Math.random().toString(36).substr(2, 9),
        name: newName,
        parentId: currentFolderId,
        createdAt: Date.now(),
      };
      setFolders((prev) => [...prev, newFolder]);
    } else {
      setIsAnalyzing(true);
      const aiData = await analyzeFileAI(newName, newType);
      const newItem: FileItem = {
        id: Math.random().toString(36).substr(2, 9),
        name: newName,
        type: newType as ItemType,
        parentId: currentFolderId,
        createdAt: Date.now(),
        url: newUrl,
        description: aiData.description,
        tags: aiData.tags,
      };
      setItems((prev) => [...prev, newItem]);
      setIsAnalyzing(false);
    }

    setNewName("");
    setNewUrl("");
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
      />

      <main className="flex-1 flex flex-col min-w-0 bg-white md:rounded-l-[40px] shadow-2xl relative overflow-hidden">
        <Header onSearch={setSearchQuery} onNew={() => setIsModalOpen(true)} />

        <div className="flex-1 overflow-y-auto no-scrollbar pb-20 px-8">
          <div className="max-w-7xl mx-auto">
            {/* Breadcrumbs & Title */}
            <div className="pt-8">
              <nav className="flex items-center gap-1 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
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
                      className="hover:text-blue-600 transition-colors truncate max-w-[120px]"
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
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {sortedAndFilteredItems.map((item) => (
                <FileCard
                  key={item.id}
                  item={item}
                  onOpen={(item: unknown) =>
                    handleOpen(item as FileItem | FolderItem)
                  }
                  onDelete={handleDelete}
                  isDeleting={deletingId === item.id}
                />
              ))}

              {/* Empty State */}
              {sortedAndFilteredItems.length === 0 && (
                <div className="col-span-full py-32 flex flex-col items-center justify-center text-center opacity-60">
                  <div className="bg-gray-50 p-8 rounded-[40px] mb-6 border border-gray-100">
                    <ICONS.Cloud className="w-16 h-16 text-gray-200" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    No assets found
                  </h3>
                  <p className="text-sm text-gray-500 max-w-xs mx-auto mt-2">
                    Try changing your filters or add a new asset to this space.
                  </p>
                </div>
              )}
            </div>
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
          isAnalyzing={isAnalyzing}
          handleCreate={handleCreate}
        />
      )}
    </div>
  );
}
