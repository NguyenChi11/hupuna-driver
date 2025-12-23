import React from "react";
import { ICONS } from "@/components/constants";

interface SidebarProps {
  currentSection: string;
  setSection: (s: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentSection, setSection }) => {
  const menuItems = [
    { id: "all", label: "All Files", icon: ICONS.Cloud },
    { id: "folder", label: "Folders", icon: ICONS.Folder },
    { id: "image", label: "Images", icon: ICONS.Image },
    { id: "video", label: "Videos", icon: ICONS.Video },
    { id: "link", label: "Links", icon: ICONS.Link },
    { id: "file", label: "Documents", icon: ICONS.File },
  ];

  return (
    <div className="w-64 bg-white h-screen border-r border-gray-100 flex flex-col pt-6 hidden md:flex">
      <div className="px-6 mb-8 flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-100">
          <ICONS.Cloud className="text-white w-6 h-6" />
        </div>
        <span className="font-bold text-xl text-gray-900 tracking-tight">
          CorpDrive
        </span>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
          Navigation
        </p>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setSection(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              currentSection === item.id
                ? "bg-blue-50 text-blue-700 shadow-sm"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <item.icon
              className={`w-5 h-5 ${
                currentSection === item.id ? "text-blue-600" : "text-gray-400"
              }`}
            />
            {item.label}
          </button>
        ))}

        <div className="pt-6">
          <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
            System
          </p>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50">
            <ICONS.Trash className="w-5 h-5 text-gray-400" />
            Trash
          </button>
        </div>
      </nav>
      <div className="p-6">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 border border-gray-200/50">
          <p className="text-[10px] text-gray-500 mb-2 font-bold uppercase tracking-tighter">
            Storage Status
          </p>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2 overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full w-[45%]"></div>
          </div>
          <p className="text-[10px] text-gray-600 font-medium">
            7.2 GB of 15 GB (45%)
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
