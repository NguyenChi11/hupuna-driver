"use client";
import React from "react";
import { useRouter } from "next/navigation";
import AssetModal from "@/components/assets/AssetModal";
import FilterBar from "@/components/ui/FilterBar";
import Header from "@/components/ui/Header";
import MobileSidebar from "@/components/ui/MobileSidebar";
import Sidebar from "@/components/ui/SideBar";
import { useDrive } from "@/hooks/useDrive";
import Breadcrumbs from "@/components/drive/Breadcrumbs";
import SelectionBox from "@/components/drive/SelectionBox";
import SelectionToolbar from "@/components/drive/SelectionToolbar";
import DriveContent from "@/components/drive/DriveContent";

export default function Home() {
  const router = useRouter();
  const {
    currentFolderId,
    folders,
    items,
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
  } = useDrive();
  const [searchText, setSearchText] = React.useState("");

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
          onSearch={setSearchText}
          onNew={() => setIsModalOpen(true)}
          onOpenSidebar={() => setIsMobileSidebarOpen(true)}
          onLogout={() => {
            router.push("/login");
          }}
          onSubmitSearch={(q) => {
            setSearchText(q);
            setSearchQuery(q);
            setSidebarSection("all");
            setActiveType("all");
          }}
          searchResults={
            (searchText || "").trim().length > 0
              ? [
                  ...folders.filter(
                    (f) =>
                      !f.trashedAt &&
                      f.name
                        .toLowerCase()
                        .includes((searchText || "").toLowerCase())
                  ),
                  ...items.filter(
                    (i) =>
                      !i.trashedAt &&
                      (i.name
                        .toLowerCase()
                        .includes((searchText || "").toLowerCase()) ||
                        i.tags?.some((t) =>
                          t
                            .toLowerCase()
                            .includes((searchText || "").toLowerCase())
                        ))
                  ),
                ].slice(0, 20)
              : []
          }
          onOpenResult={(item) => {
            handleOpen(item);
            setSearchText(searchText);
          }}
        />

        <div
          className="flex-1 overflow-y-auto custom-scrollbar pb-20 px-4 md:px-8 relative"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {isDragging && (
            <SelectionBox dragStart={dragStart} dragCurrent={dragCurrent} />
          )}

          <div
            className={`max-w-7xl mx-auto ${isDragging ? "select-none" : ""}`}
          >
            <Breadcrumbs
              breadcrumbs={breadcrumbs}
              currentFolderId={currentFolderId}
              sidebarSection={sidebarSection}
              onNavigate={setCurrentFolderId}
              onSidebarSectionChange={setSidebarSection}
              isSelectionMode={isSelectionMode}
              onToggleSelectionMode={() => setIsSelectionMode(!isSelectionMode)}
              onClearSelection={() => setSelectedItems(new Set())}
            />

            <SelectionToolbar
              selectedCount={selectedItems.size}
              sidebarSection={sidebarSection}
              onRestore={handleBulkRestore}
              onDownload={handleBulkDownload}
              onDelete={handleBulkDelete}
              onCancel={() => {
                setSelectedItems(new Set());
                setIsSelectionMode(false);
              }}
            />

            <FilterBar
              activeType={activeType}
              setActiveType={setActiveType}
              counts={counts}
            />

            <DriveContent
              sidebarSection={sidebarSection}
              activeType={activeType}
              sortedAndFilteredItems={sortedAndFilteredItems}
              deletingId={deletingId}
              selectedItems={selectedItems}
              isSelectionMode={isSelectionMode}
              onSelect={handleSelect}
              onOpen={handleOpen}
              onDelete={handleDelete}
              onRename={handleRename}
              onDownload={handleDownload}
              onRestore={handleRestore}
              onToggleStar={handleToggleStar}
            />
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
          files={files}
          setFiles={setFiles}
          isAnalyzing={isAnalyzing}
          handleCreate={handleCreate}
        />
      )}
    </div>
  );
}
