"use client";
import { ICONS, STORAGE_KEY } from "@/components/constants";
import AssetModal from "@/components/ui/AssetModal";
import FileCard from "@/components/ui/FileCard";
import FilterBar from "@/components/ui/FilterBar";
import Header from "@/components/ui/Header";
import MobileSidebar from "@/components/ui/MobileSidebar";
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
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(
    null
  );
  const [dragCurrent, setDragCurrent] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const initialSelectionRef = React.useRef<Set<string>>(new Set());

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

    // Trash view
    if (sidebarSection === "trash") {
      const trashedFolders = folders.filter((f) => f.trashedAt);
      const trashedItems = items.filter((i) => i.trashedAt);
      resultItems = [...trashedFolders, ...trashedItems];
      const typeOrder = ["folder", "image", "video", "link", "file"];
      resultItems.sort((a, b) => {
        const ta = "type" in a ? a.type : "folder";
        const tb = "type" in b ? b.type : "folder";
        const orderDiff = typeOrder.indexOf(ta) - typeOrder.indexOf(tb);
        if (orderDiff !== 0) return orderDiff;
        const aTime = (a as FileItem).trashedAt || a.createdAt;
        const bTime = (b as FileItem).trashedAt || b.createdAt;
        return bTime - aTime;
      });
    }
    // Global navigation vs Folder browsing
    else if (sidebarSection !== "all") {
      const isGlobal = sidebarSection.startsWith("global:");
      const type = isGlobal ? sidebarSection.slice(7) : sidebarSection;
      const scopeTarget = isGlobal ? "global" : "local";
      if (type === "all") {
        const scopedFolders = folders
          .filter(
            (f) => (f.scope === "global" ? "global" : "local") === scopeTarget
          )
          .filter((f) => !f.trashedAt);
        const scopedItems = items
          .filter(
            (i: FileItem) =>
              (i.scope === "global" ? "global" : "local") === scopeTarget
          )
          .filter((i) => !i.trashedAt);
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
        resultItems = folders
          .filter(
            (f) => (f.scope === "global" ? "global" : "local") === scopeTarget
          )
          .filter((f) => !f.trashedAt);
      } else {
        resultItems = items
          .filter(
            (i) =>
              i.type === (type as ItemType) &&
              (i.scope === "global" ? "global" : "local") === scopeTarget
          )
          .filter((i) => !i.trashedAt);
      }
    } else {
      // "All Files" logic
      const currentFolders = folders
        .filter(
          (f) =>
            f.parentId === currentFolderId && (f.scope ?? "local") === "local"
        )
        .filter((f) => !f.trashedAt);
      const currentFiles = items
        .filter(
          (i: FileItem) =>
            i.parentId === currentFolderId && (i.scope ?? "local") === "local"
        )
        .filter((i) => !i.trashedAt);

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
    let baseItems: (FileItem | FolderItem)[] = [];
    if (sidebarSection === "trash") {
      baseItems = [
        ...folders.filter((f) => f.trashedAt),
        ...items.filter((i) => i.trashedAt),
      ];
    } else if (sidebarSection !== "all") {
      baseItems = sortedAndFilteredItems;
    } else {
      baseItems = [
        ...folders.filter(
          (f) =>
            f.parentId === currentFolderId &&
            (f.scope ?? "local") === "local" &&
            !f.trashedAt
        ),
        ...items.filter(
          (i: FileItem) =>
            i.parentId === currentFolderId &&
            (i.scope ?? "local") === "local" &&
            !i.trashedAt
        ),
      ];
    }

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
      if (sidebarSection === "trash") {
        // Permanent delete
        if (type === "folder")
          setFolders((prev) => prev.filter((f) => f.id !== id));
        else setItems((prev) => prev.filter((i) => i.id !== id));
      } else {
        // Move to trash
        if (type === "folder")
          setFolders((prev) =>
            prev.map((f) => (f.id === id ? { ...f, trashedAt: Date.now() } : f))
          );
        else
          setItems((prev) =>
            prev.map((i) => (i.id === id ? { ...i, trashedAt: Date.now() } : i))
          );
      }
      setDeletingId(null);
    }, 400);
  };

  const handleRestore = (id: string, type: "item" | "folder") => {
    setDeletingId(id);
    setTimeout(() => {
      if (type === "folder") {
        setFolders((prev) =>
          prev.map((f) => (f.id === id ? { ...f, trashedAt: undefined } : f))
        );
      } else {
        setItems((prev) =>
          prev.map((i) => (i.id === id ? { ...i, trashedAt: undefined } : i))
        );
      }
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

  const handleSelect = (id: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleBulkDelete = () => {
    if (selectedItems.size === 0) return;

    if (sidebarSection === "trash") {
      // Permanent delete
      setFolders((prev) => prev.filter((f) => !selectedItems.has(f.id)));
      setItems((prev) => prev.filter((i) => !selectedItems.has(i.id)));
    } else {
      // Move to trash
      const now = Date.now();
      setFolders((prev) =>
        prev.map((f) =>
          selectedItems.has(f.id) ? { ...f, trashedAt: now } : f
        )
      );
      setItems((prev) =>
        prev.map((i) =>
          selectedItems.has(i.id) ? { ...i, trashedAt: now } : i
        )
      );
    }
    setSelectedItems(new Set());
    setIsSelectionMode(false);
  };

  const handleBulkRestore = () => {
    if (selectedItems.size === 0) return;

    setFolders((prev) =>
      prev.map((f) =>
        selectedItems.has(f.id) ? { ...f, trashedAt: undefined } : f
      )
    );
    setItems((prev) =>
      prev.map((i) =>
        selectedItems.has(i.id) ? { ...i, trashedAt: undefined } : i
      )
    );
    setSelectedItems(new Set());
    setIsSelectionMode(false);
  };

  const handleDownload = (item: FileItem | FolderItem) => {
    if ("type" in item && item.url) {
      const link = document.createElement("a");
      link.href = item.url;
      link.download = item.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert("Folder download is not supported yet.");
    }
  };

  const handleBulkDownload = () => {
    if (selectedItems.size === 0) return;

    let downloadCount = 0;
    items.forEach((item) => {
      if (selectedItems.has(item.id)) {
        if (item.url) {
          downloadCount++;
          // Add a small delay between downloads to prevent browser blocking
          setTimeout(() => {
            const link = document.createElement("a");
            link.href = item.url!;
            link.download = item.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }, downloadCount * 500);
        }
      }
    });

    if (downloadCount === 0) {
      alert("No downloadable files selected.");
    } else {
      setSelectedItems(new Set());
      setIsSelectionMode(false);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Check if target is interactive (button, input, link)
    if ((e.target as HTMLElement).closest("button, input, a")) return;

    // Don't start selection box if clicking on an item (allow for future drag-and-drop)
    if ((e.target as HTMLElement).closest("[data-id]")) return;

    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setDragCurrent({ x: e.clientX, y: e.clientY });

    // If shift/ctrl is not pressed, clear previous selection
    if (!e.shiftKey && !e.ctrlKey) {
      setSelectedItems(new Set());
      initialSelectionRef.current = new Set();
    } else {
      initialSelectionRef.current = new Set(selectedItems);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragStart) return;

    if (!isSelectionMode) setIsSelectionMode(true);

    setDragCurrent({ x: e.clientX, y: e.clientY });

    // Calculate selection rect
    const selectionRect = {
      left: Math.min(dragStart.x, e.clientX),
      top: Math.min(dragStart.y, e.clientY),
      width: Math.abs(e.clientX - dragStart.x),
      height: Math.abs(e.clientY - dragStart.y),
    };

    // Find intersecting items
    const newSelected = new Set(initialSelectionRef.current);

    document.querySelectorAll("[data-id]").forEach((el) => {
      const rect = el.getBoundingClientRect();
      const isIntersecting = !(
        rect.right < selectionRect.left ||
        rect.left > selectionRect.left + selectionRect.width ||
        rect.bottom < selectionRect.top ||
        rect.top > selectionRect.top + selectionRect.height
      );

      if (isIntersecting) {
        newSelected.add(el.getAttribute("data-id")!);
      }
    });

    setSelectedItems(newSelected);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
    setDragCurrent(null);
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
        <Header
          onSearch={setSearchQuery}
          onNew={() => setIsModalOpen(true)}
          onOpenSidebar={() => setIsMobileSidebarOpen(true)}
        />

        <div
          className="flex-1 overflow-y-auto custom-scrollbar pb-20 px-8 relative"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {isDragging && dragStart && dragCurrent && (
            <div
              className="fixed border border-blue-500 bg-blue-500/20 z-50 pointer-events-none"
              style={{
                left: Math.min(dragStart.x, dragCurrent.x),
                top: Math.min(dragStart.y, dragCurrent.y),
                width: Math.abs(dragCurrent.x - dragStart.x),
                height: Math.abs(dragCurrent.y - dragStart.y),
              }}
            />
          )}
          <div
            className={`max-w-7xl mx-auto ${isDragging ? "select-none" : ""}`}
          >
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
              <button
                onClick={() => {
                  setIsSelectionMode(!isSelectionMode);
                  if (isSelectionMode) setSelectedItems(new Set());
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                  isSelectionMode
                    ? "bg-blue-100 text-blue-700 font-bold"
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                <ICONS.CheckSquare className="w-5 h-5" />
                {isSelectionMode ? "Cancel Selection" : "Select Items"}
              </button>
            </div>

            {/* Selection Toolbar */}
            {selectedItems.size > 0 && (
              <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white shadow-2xl border border-gray-100 rounded-full px-6 py-3 flex items-center gap-4 z-50 animate-in slide-in-from-bottom-4 duration-200">
                <span className="text-sm font-bold text-gray-700">
                  {selectedItems.size} selected
                </span>
                <div className="h-4 w-px bg-gray-200" />
                {sidebarSection === "trash" && (
                  <button
                    onClick={handleBulkRestore}
                    className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-green-600 transition-colors"
                  >
                    <ICONS.Restore className="w-5 h-5" />
                    Restore
                  </button>
                )}
                {sidebarSection !== "trash" && (
                  <button
                    onClick={handleBulkDownload}
                    className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <ICONS.Download className="w-5 h-5" />
                    Download
                  </button>
                )}
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-red-600 transition-colors"
                >
                  <ICONS.Trash className="w-5 h-5" />
                  {sidebarSection === "trash" ? "Delete Forever" : "Delete"}
                </button>
                <div className="h-4 w-px bg-gray-200" />
                <button
                  onClick={() => {
                    setSelectedItems(new Set());
                    setIsSelectionMode(false);
                  }}
                  className="text-sm font-bold text-gray-500 hover:text-gray-900"
                >
                  Cancel
                </button>
              </div>
            )}

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
                            onOpen={(item: unknown) => {
                              if (isSelectionMode) {
                                handleSelect(
                                  (item as FileItem | FolderItem).id
                                );
                              } else {
                                handleOpen(item as FileItem | FolderItem);
                              }
                            }}
                            onDelete={handleDelete}
                            onRename={handleRename}
                            onDownload={handleDownload}
                            isDeleting={deletingId === item.id}
                            isSelected={selectedItems.has(item.id)}
                            onSelect={
                              isSelectionMode
                                ? () => handleSelect(item.id)
                                : undefined
                            }
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
            ) : sidebarSection === "trash" ? (
              <>
                {(() => {
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
                        <h3 className="text-xl font-bold text-gray-900">
                          No assets found
                        </h3>
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
                                    handleSelect(
                                      (item as FileItem | FolderItem).id
                                    );
                                  } else {
                                    handleOpen(item as FileItem | FolderItem);
                                  }
                                }}
                                onDelete={handleDelete}
                                onRename={handleRename}
                                onRestore={handleRestore}
                                onDownload={handleDownload}
                                isDeleting={deletingId === item.id}
                                isSelected={selectedItems.has(item.id)}
                                onSelect={
                                  isSelectionMode
                                    ? () => handleSelect(item.id)
                                    : undefined
                                }
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
                                    handleSelect(
                                      (item as FileItem | FolderItem).id
                                    );
                                  } else {
                                    handleOpen(item as FileItem | FolderItem);
                                  }
                                }}
                                onDelete={handleDelete}
                                onRename={handleRename}
                                onRestore={handleRestore}
                                onDownload={handleDownload}
                                isDeleting={deletingId === item.id}
                                isSelected={selectedItems.has(item.id)}
                                onSelect={
                                  isSelectionMode
                                    ? () => handleSelect(item.id)
                                    : undefined
                                }
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    {sidebarSection.charAt(0).toUpperCase() +
                      sidebarSection.slice(1)}
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
                          handleSelect((item as FileItem | FolderItem).id);
                        } else {
                          handleOpen(item as FileItem | FolderItem);
                        }
                      }}
                      onDelete={handleDelete}
                      onRename={handleRename}
                      onDownload={handleDownload}
                      isDeleting={deletingId === item.id}
                      isSelected={selectedItems.has(item.id)}
                      onSelect={
                        isSelectionMode
                          ? () => handleSelect(item.id)
                          : undefined
                      }
                    />
                  ))}
                </div>
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
            )}
          </div>
        </div>
        <MobileSidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
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
