import React from "react";
import { ICONS } from "@/components/constants";

interface SelectionToolbarProps {
  selectedCount: number;
  sidebarSection: string;
  onRestore: () => void;
  onDownload: () => void;
  onDelete: () => void;
  onCancel: () => void;
}

export default function SelectionToolbar({
  selectedCount,
  sidebarSection,
  onRestore,
  onDownload,
  onDelete,
  onCancel,
}: SelectionToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white shadow-2xl border border-gray-100 rounded-full px-6 py-3 flex items-center gap-4 z-50 animate-in slide-in-from-bottom-4 duration-200">
      <span className="text-sm font-bold text-gray-700">
        {selectedCount} selected
      </span>
      <div className="h-4 w-px bg-gray-200" />
      {sidebarSection === "trash" && (
        <button
          onClick={onRestore}
          className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-green-600 transition-colors"
        >
          <ICONS.Restore className="w-5 h-5" />
          Restore
        </button>
      )}
      {sidebarSection !== "trash" && (
        <button
          onClick={onDownload}
          className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-blue-600 transition-colors"
        >
          <ICONS.Download className="w-5 h-5" />
          Download
        </button>
      )}
      <button
        onClick={onDelete}
        className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-red-600 transition-colors"
      >
        <ICONS.Trash className="w-5 h-5" />
        {sidebarSection === "trash" ? "Delete Forever" : "Delete"}
      </button>
      <div className="h-4 w-px bg-gray-200" />
      <button
        onClick={onCancel}
        className="text-sm font-bold text-gray-500 hover:text-gray-900"
      >
        Cancel
      </button>
    </div>
  );
}
