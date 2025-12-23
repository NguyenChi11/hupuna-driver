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
    <div className="flex items-center gap-2 px-8 py-4 overflow-x-auto no-scrollbar bg-white/50 border-b border-gray-50">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => setActiveType(filter.id)}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all flex items-center gap-2 ${
            activeType === filter.id
              ? "bg-blue-600 border-blue-600 text-white shadow-md"
              : "bg-white border-gray-100 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
          }`}
        >
          {filter.icon && <filter.icon className="w-3.5 h-3.5" />}
          {filter.label}
          <span
            className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] ${
              activeType === filter.id ? "bg-white/20" : "bg-gray-100"
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
