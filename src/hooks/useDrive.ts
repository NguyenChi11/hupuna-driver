import React, { useEffect, useMemo, useState } from "react";
import { FileItem, FolderItem, ItemType } from "@/types/types";
import { INITIAL_FOLDERS, INITIAL_ITEMS } from "@/data/testData";
import { STORAGE_KEY } from "@/components/constants";
import { analyzeFileAI } from "@/service/mockAiService";

export const useDrive = () => {
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
  const [files, setFiles] = useState<File[]>([]);
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

  const baseItems = useMemo(() => {
    let resultItems: (FileItem | FolderItem)[] = [];

    // Trash view
    if (sidebarSection === "trash") {
      const trashedFolders = folders.filter((f) => f.trashedAt);
      const trashedItems = items.filter((i) => i.trashedAt);
      resultItems = [...trashedFolders, ...trashedItems];
    }
    // Starred view
    else if (sidebarSection === "starred") {
      const starredFolders = folders.filter((f) => f.starred && !f.trashedAt);
      const starredItems = items.filter((i) => i.starred && !i.trashedAt);
      resultItems = [...starredFolders, ...starredItems];
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
      const currentFolders = folders
        .filter((f) => (f.scope ?? "local") === "local")
        .filter((f) => !f.trashedAt);
      const currentFiles = items
        .filter((i: FileItem) => (i.scope ?? "local") === "local")
        .filter((i) => !i.trashedAt);

      if (currentFolderId) {
        resultItems = [
          ...currentFolders.filter((f) => f.parentId === currentFolderId),
          ...currentFiles.filter((i) => i.parentId === currentFolderId),
        ];
      } else {
        resultItems = [...currentFolders, ...currentFiles];
      }
    }
    return resultItems;
  }, [currentFolderId, folders, items, sidebarSection]);

  const searchedItems = useMemo(() => {
    let result = baseItems;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item: FileItem | FolderItem) =>
          item.name.toLowerCase().includes(q) ||
          ("tags" in item &&
            item.tags?.some((t) => t.toLowerCase().includes(q)))
      );
    }
    return result;
  }, [baseItems, searchQuery]);

  const sortedAndFilteredItems = useMemo(() => {
    let resultItems = searchedItems;

    // Contextual Navigation Filter (Horizontal bar)
    if (activeType !== "all") {
      resultItems = resultItems.filter((item: FileItem | FolderItem) => {
        const itemType = "type" in item ? item.type : "folder";
        return itemType === activeType;
      });
    }

    // Sorting
    const typeOrder = ["folder", "image", "video", "link", "file"];
    resultItems.sort((a, b) => {
      if (sidebarSection === "trash") {
        const ta = "type" in a ? a.type : "folder";
        const tb = "type" in b ? b.type : "folder";
        const orderDiff = typeOrder.indexOf(ta) - typeOrder.indexOf(tb);
        if (orderDiff !== 0) return orderDiff;
        const aTime = (a as FileItem).trashedAt || a.createdAt;
        const bTime = (b as FileItem).trashedAt || b.createdAt;
        return bTime - aTime;
      } else {
        const typeA = "type" in a ? a.type : "folder";
        const typeB = "type" in b ? b.type : "folder";
        const orderDiff = typeOrder.indexOf(typeA) - typeOrder.indexOf(typeB);
        if (orderDiff !== 0) return orderDiff;
        return b.createdAt - a.createdAt;
      }
    });

    return resultItems;
  }, [searchedItems, activeType, sidebarSection]);

  const counts = useMemo(() => {
    return {
      all: searchedItems.length,
      folder: searchedItems.filter((i) => !("type" in i)).length,
      image: searchedItems.filter((i) => "type" in i && i.type === "image")
        .length,
      video: searchedItems.filter((i) => "type" in i && i.type === "video")
        .length,
      link: searchedItems.filter((i) => "type" in i && i.type === "link")
        .length,
      file: searchedItems.filter((i) => "type" in i && i.type === "file")
        .length,
    };
  }, [searchedItems]);

  const handleCreate = async () => {
    if (newType === "folder" && !newName) return;
    if (newType === "link") {
      if (!newUrl) return; // Must have URL for link
    } else {
      if (newType !== "folder" && !newName && !newUrl && files.length === 0)
        return;
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
      setIsAnalyzing(true);
      const newItems: FileItem[] = [];

      if (newType !== "link" && files.length > 0) {
        // Multi-file upload
        for (const f of files) {
          let finalName = f.name;
          if (files.length === 1 && newName) {
            finalName = newName;
          }

          const aiData = await analyzeFileAI(finalName, newType);
          const finalUrl = URL.createObjectURL(f);

          newItems.push({
            id: Math.random().toString(36).substr(2, 9),
            name: finalName,
            type: newType as ItemType,
            parentId: targetParentId,
            createdAt: Date.now(),
            url: finalUrl,
            size: f.size,
            description: aiData.description,
            tags: aiData.tags,
            scope: scopeTarget,
          });
        }
      } else {
        let finalName = newName;
        if (!finalName) {
          if (newType === "link") {
            finalName = newUrl;
          } else {
            if (newUrl) finalName = newUrl;
            else finalName = "Untitled";
          }
        }

        const aiData = await analyzeFileAI(finalName, newType);

        newItems.push({
          id: Math.random().toString(36).substr(2, 9),
          name: finalName,
          type: newType as ItemType,
          parentId: targetParentId,
          createdAt: Date.now(),
          url: newUrl,
          size: undefined,
          description: aiData.description,
          tags: aiData.tags,
          scope: scopeTarget,
        });
      }

      setItems((prev) => [...prev, ...newItems]);
      setIsAnalyzing(false);
    }

    setNewName("");
    setNewUrl("");
    setFiles([]);
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

  const handleToggleStar = (id: string, type: "item" | "folder") => {
    if (type === "folder") {
      setFolders((prev) =>
        prev.map((f) => (f.id === id ? { ...f, starred: !f.starred } : f))
      );
    } else {
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, starred: !i.starred } : i))
      );
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

  return {
    currentFolderId,
    folders,
    items,
    searchQuery,
    sidebarSection,
    activeType,
    isModalOpen,
    newType,
    newName,
    newUrl,
    files,
    isAnalyzing,
    deletingId,
    selectedItems,
    isSelectionMode,
    isMobileSidebarOpen,
    isDragging,
    dragStart,
    dragCurrent,
    breadcrumbs,
    sortedAndFilteredItems,
    counts,
    setCurrentFolderId,
    setFolders,
    setItems,
    setSearchQuery,
    setSidebarSection,
    setActiveType,
    setIsModalOpen,
    setNewType,
    setNewName,
    setNewUrl,
    setFiles,
    setIsMobileSidebarOpen,
    setIsSelectionMode,
    setSelectedItems,
    handleCreate,
    handleDelete,
    handleRestore,
    handleRename,
    handleOpen,
    handleSelect,
    handleBulkDelete,
    handleBulkRestore,
    handleDownload,
    handleBulkDownload,
    handleToggleStar,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
};
