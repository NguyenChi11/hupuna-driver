import React from "react";
import { ICONS } from "@/components/constants";
import { FolderItem } from "@/types/types";

interface BreadcrumbsProps {
  breadcrumbs: FolderItem[];
  currentFolderId: string | null;
  sidebarSection: string;
  onNavigate: (folderId: string | null) => void;
  onSidebarSectionChange: (section: string) => void;
  isSelectionMode: boolean;
  onToggleSelectionMode: () => void;
  onClearSelection: () => void;
}

export default function Breadcrumbs({
  breadcrumbs,
  currentFolderId,
  sidebarSection,
  onNavigate,
  onSidebarSectionChange,
  isSelectionMode,
  onToggleSelectionMode,
  onClearSelection,
}: BreadcrumbsProps) {
  return (
    <div className="pt-8">
      <nav className="flex items-center gap-1 text-[0.875rem] font-black text-gray-400 uppercase tracking-widest mb-1">
        <button
          onClick={() => {
            onNavigate(null);
            onSidebarSectionChange("all");
          }}
          className="hover:text-blue-600 transition-colors"
        >
          My Drive
        </button>
        {breadcrumbs.map((f) => (
          <React.Fragment key={f.id}>
            <ICONS.ChevronRight className="w-3 h-3 mx-1" />
            <button
              onClick={() => onNavigate(f.id)}
              className="hover:text-blue-600 transition-colors truncate max-w-30"
            >
              {f.name}
            </button>
          </React.Fragment>
        ))}
      </nav>
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-6">
        {sidebarSection !== "all"
          ? sidebarSection.charAt(0).toUpperCase() + sidebarSection.slice(1)
          : breadcrumbs[breadcrumbs.length - 1]?.name || "Drive Root"}
      </h1>
      <button
        onClick={() => {
          onToggleSelectionMode();
          if (isSelectionMode) onClearSelection();
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
  );
}
