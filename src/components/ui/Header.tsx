import React from "react";
import { ICONS } from "@/components/constants";

interface HeaderProps {
  onSearch: (q: string) => void;
  onNew: () => void;
  onOpenSidebar?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSearch, onNew, onOpenSidebar }) => {
  return (
    <header className="py-4 bg-white/80 backdrop-blur-md border-b border-gray-100 flex md:flex-row flex-col items-center justify-between px-4 md:px-8 sticky top-0 z-20 gap-4 ">
      <div className="flex items-center gap-3 md:gap-0 flex-1 max-w-2xl relative group w-full">
        {onOpenSidebar && (
          <button
            onClick={onOpenSidebar}
            className="md:hidden cursor-pointer p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 active:scale-95 transition"
            aria-label="Open sidebar"
            title="Open sidebar"
          >
            <ICONS.Menu className="w-5 h-5" />
          </button>
        )}
        <ICONS.Search className="absolute md:left-4 left-16 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
        <input
          type="text"
          placeholder="Search corporate drive..."
          onChange={(e) => onSearch(e.target.value)}
          className="w-full bg-gray-100/50 border border-transparent rounded-2xl pl-12 pr-4 py-3 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-200 transition-all text-sm font-medium"
        />
      </div>
      <div className="flex items-center gap-6 w-full justify-end md:w-1/3">
        <button
          onClick={onNew}
          className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-200 active:scale-95"
        >
          <ICONS.Plus className="w-5 h-5" />
          <span>New Asset</span>
        </button>
        <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
          <div className="h-10 w-10 rounded-2xl bg-linear-to-tr from-blue-600 to-blue-400 flex items-center justify-center text-white font-bold text-sm shadow-md">
            JD
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
