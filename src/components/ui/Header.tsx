import React from "react";
import { ICONS } from "@/components/constants";

interface HeaderProps {
  onSearch: (q: string) => void;
  onNew: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSearch, onNew }) => {
  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-20">
      <div className="flex-1 max-w-2xl relative group">
        <ICONS.Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
        <input
          type="text"
          placeholder="Search corporate drive..."
          onChange={(e) => onSearch(e.target.value)}
          className="w-full bg-gray-100/50 border border-transparent rounded-2xl pl-12 pr-4 py-3 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-200 transition-all text-sm font-medium"
        />
      </div>
      <div className="flex items-center gap-6 ml-6">
        <button
          onClick={onNew}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-200 active:scale-95"
        >
          <ICONS.Plus className="w-5 h-5" />
          <span>New Asset</span>
        </button>
        <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center text-white font-bold text-sm shadow-md">
            JD
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
