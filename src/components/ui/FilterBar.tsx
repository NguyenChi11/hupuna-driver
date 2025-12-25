import React from "react";
import { ICONS } from "@/components/constants";

interface FilterBarProps {
  activeType: string;
  setActiveType: (t: string) => void;
  counts: Record<string, number>;
}

const FilterBar: React.FC<FilterBarProps> = ({
  activeType,
  setActiveType,
  counts,
}) => {
  const filters = [
    { id: "all", label: "All Assets", icon: null },
    { id: "folder", label: "Folders", icon: ICONS.Folder },
    { id: "image", label: "Images", icon: ICONS.Image },
    { id: "video", label: "Videos", icon: ICONS.Video },
    { id: "link", label: "Links", icon: ICONS.Link },
    { id: "file", label: "Documents", icon: ICONS.File },
  ];

  return (
    <div className="flex items-center gap-3 py-4 overflow-x-auto custom-scrollbar bg-white border-b border-gray-200">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => setActiveType(filter.id)}
          className={`cursor-pointer flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all shadow-sm hover:shadow ${
            activeType === filter.id
              ? "bg-blue-600 text-white"
              : "bg-gray-50 text-gray-700 hover:bg-gray-100"
          }`}
        >
          {filter.icon && (
            <filter.icon
              className={`w-5 h-5 ${
                activeType === filter.id ? "text-white" : "text-gray-600"
              }`}
            />
          )}
          <span>{filter.label}</span>
          <span
            className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
              activeType === filter.id
                ? "bg-white text-blue-600"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {counts[filter.id] || 0}
          </span>
        </button>
      ))}
    </div>
  );
};

export default FilterBar;
