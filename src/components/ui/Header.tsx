import React from "react";
import { ICONS } from "@/components/constants";

interface HeaderProps {
  onSearch: (q: string) => void;
  onNew: () => void;
  onOpenSidebar?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSearch, onNew, onOpenSidebar }) => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between gap-4 px-4 md:px-6 sticky top-0 z-50">
      {/* Left: Menu (mobile) + Logo + Search */}
      <div className="flex items-center gap-4 flex-1 max-w-4xl">
        {onOpenSidebar && (
          <button
            onClick={onOpenSidebar}
            className="cursor-pointer md:hidden p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition"
            aria-label="Open sidebar"
          >
            <ICONS.Menu className="w-6 h-6 text-gray-700" />
          </button>
        )}

        {/* Search bar - kiểu Google Drive */}
        <div className="flex-1 max-w-3xl">
          <div className="relative">
            <ICONS.Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search corporate drive..."
              onChange={(e) => onSearch(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-gray-100 hover:bg-gray-150 focus:bg-white rounded-3xl border border-transparent focus:border-blue-500 focus:outline-none focus:shadow-md transition-all text-base"
            />
          </div>
        </div>
      </div>

      {/* Right: New button + Avatar */}
      <div className="flex items-center gap-4">
        <button
          onClick={onNew}
          className="cursor-pointer hidden md:flex items-center gap-2 px-6 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full font-medium shadow-sm hover:shadow transition-all"
        >
          <ICONS.Plus className="w-5 h-5" />
          <span>New Asset</span>
        </button>

        {/* Mobile New button - có thể dùng FAB riêng, nhưng giữ đơn giản */}
        <button
          onClick={onNew}
          className="cursor-pointer md:hidden p-3 bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition"
        >
          <ICONS.Plus className="w-6 h-6" />
        </button>

        {/* User avatar */}
        <button className="cursor-pointer w-10 h-10 rounded-full bg-linear-to-tr from-blue-600 to-blue-400 flex items-center justify-center text-white font-bold text-sm shadow-md hover:shadow-lg transition">
          JD
        </button>
      </div>
    </header>
  );
};

export default Header;
