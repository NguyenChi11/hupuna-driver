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
  const getFolderName = () => {
    if (sidebarSection !== "all") {
      return sidebarSection.charAt(0).toUpperCase() + sidebarSection.slice(1);
    }
    return breadcrumbs[breadcrumbs.length - 1]?.name || "My Drive";
  };

  return (
    <div className="py-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-gray-600 mb-4">
        <button
          onClick={() => {
            onNavigate(null);
            onSidebarSectionChange("all");
          }}
          className="font-medium hover:text-blue-600 transition-colors"
        >
          My Drive
        </button>

        {breadcrumbs.map((folder, index) => (
          <React.Fragment key={folder.id}>
            <ICONS.ChevronRight className="w-4 h-4 text-gray-400" />
            <button
              onClick={() => onNavigate(folder.id)}
              className={`font-medium hover:text-blue-600 transition-colors ${
                index === breadcrumbs.length - 1 ? "text-gray-900" : ""
              }`}
            >
              {folder.name}
            </button>
          </React.Fragment>
        ))}
      </nav>

      {/* Title */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          {getFolderName()}
        </h1>

        {/* Select Button */}
        <button
          onClick={() => {
            onToggleSelectionMode();
            if (isSelectionMode) onClearSelection();
          }}
          className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full font-medium transition-all shadow-sm hover:shadow ${
            isSelectionMode
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          <ICONS.CheckSquare className="w-5 h-5" />
          {isSelectionMode ? "Cancel" : "Select"}
        </button>
      </div>
    </div>
  );
}
