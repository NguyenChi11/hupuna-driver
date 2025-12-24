import React from "react";
import { ICONS } from "@/components/constants";

interface SidebarProps {
  currentSection: string;
  setSection: (s: string) => void;
  setSectionGlobal: (s: string) => void;
}

type IconComponent = React.ComponentType<{ className?: string }>;
type MenuItem = { id: string; label: string; icon: IconComponent };

const MenuSection: React.FC<{
  title: string;
  items: MenuItem[];
  isActive: (id: string) => boolean;
  onItemClick: (id: string) => void;
}> = ({ title, items, isActive, onItemClick }) => {
  return (
    <div className="space-y-1">
      <p className="px-3 text-[0.625rem] font-bold text-gray-400 uppercase tracking-widest mb-2">
        {title}
      </p>
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onItemClick(item.id)}
          className={`cursor-pointer w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
            isActive(item.id)
              ? "bg-blue-50 text-blue-700 shadow-sm"
              : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
          }`}
        >
          <item.icon
            className={`w-5 h-5 ${
              isActive(item.id) ? "text-blue-600" : "text-gray-400"
            }`}
          />
          {item.label}
        </button>
      ))}
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  setSection,
  setSectionGlobal,
}) => {
  const menuItems = [
    { id: "all", label: "All Files", icon: ICONS.Cloud },
    { id: "folder", label: "Folders", icon: ICONS.Folder },
    { id: "image", label: "Images", icon: ICONS.Image },
    { id: "video", label: "Videos", icon: ICONS.Video },
    { id: "link", label: "Links", icon: ICONS.Link },
    { id: "file", label: "Documents", icon: ICONS.File },
  ];

  return (
    <div className="w-64 bg-white h-screen border-r border-gray-100  flex-col pt-6 hidden md:flex">
      <div className="px-6 mb-8 flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-100">
          <ICONS.Cloud className="text-white w-6 h-6" />
        </div>
        <span className="font-bold text-xl text-gray-900 tracking-tight">
          CorpDrive
        </span>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        <MenuSection
          title="Folder"
          items={menuItems}
          isActive={(id) => currentSection === id}
          onItemClick={(id) => setSection(id)}
        />
        <MenuSection
          title="Folder Global"
          items={menuItems}
          isActive={(id) => currentSection === `global:${id}`}
          onItemClick={(id) => setSectionGlobal(`global:${id}`)}
        />

        <div className="pt-6">
          <p className="px-3 text-[0.625rem] font-bold text-gray-400 uppercase tracking-widest mb-2">
            System
          </p>
          <button
            onClick={() => setSection("trash")}
            className={`cursor-pointer w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              currentSection === "trash"
                ? "bg-blue-50 text-blue-700 shadow-sm"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <ICONS.Trash
              className={`w-5 h-5 ${
                currentSection === "trash" ? "text-blue-600" : "text-gray-400"
              }`}
            />
            Trash
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
