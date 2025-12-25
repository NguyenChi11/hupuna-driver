import React, { useState } from "react";
import { ICONS } from "@/components/constants";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
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
  const [open, setOpen] = useState(true);
  return (
    <div className="space-y-1">
      {title && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="cursor-pointer w-full px-6 py-2 text-sm font-medium text-gray-500 uppercase tracking-wider flex items-center justify-between hover:bg-gray-100 transition-colors rounded-lg"
        >
          <span>{title}</span>
          <ICONS.ChevronRight
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
              open ? "rotate-90" : ""
            }`}
          />
        </button>
      )}

      {open &&
        items.map((item) => {
          const isItemActive = isActive(item.id);
          return (
            <button
              key={item.id}
              onClick={() => onItemClick(item.id)}
              className={`
              group relative w-full flex items-center gap-4 px-6 py-2.5 text-sm font-medium cursor-pointer
              transition-colors duration-150 ease-in-out
              ${
                isItemActive
                  ? "bg-blue-50 text-blue-800 font-medium"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              }
              rounded-r-full
            `}
            >
              {isItemActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-full" />
              )}

              <item.icon
                className={`
                w-5 h-5 shrink-0 transition-colors
                ${
                  isItemActive
                    ? "text-blue-600"
                    : "text-gray-600 group-hover:text-gray-800"
                }
              `}
              />

              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
    </div>
  );
};

const MobileSidebar: React.FC<MobileSidebarProps> = ({
  isOpen,
  onClose,
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex md:hidden">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white w-full h-full shadow-2xl z-10 overflow-y-auto flex flex-col pt-6 animate-in slide-in-from-left duration-200">
        <div className="px-6 mb-8 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-100">
            <ICONS.Cloud className="text-white w-6 h-6" />
          </div>
          <span className="font-bold text-xl text-gray-900 tracking-tight">
            HupunaDriver
          </span>
          <button
            onClick={onClose}
            className="ml-auto p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <ICONS.Close className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-6 pb-6">
          <MenuSection
            title="Folder"
            items={menuItems}
            isActive={(id) => currentSection === id}
            onItemClick={(id) => {
              setSection(id);
              onClose();
            }}
          />
          <MenuSection
            title="Folder Global"
            items={menuItems}
            isActive={(id) => currentSection === `global:${id}`}
            onItemClick={(id) => {
              setSectionGlobal(`global:${id}`);
              onClose();
            }}
          />

          <MenuSection
            title="System"
            items={[
              { id: "starred", label: "Starred", icon: ICONS.Star },
              { id: "trash", label: "Trash", icon: ICONS.Trash },
            ]}
            isActive={(id) => currentSection === id}
            onItemClick={(id) => {
              setSection(id);
              onClose();
            }}
          />
        </nav>
      </div>
    </div>
  );
};

export default MobileSidebar;
