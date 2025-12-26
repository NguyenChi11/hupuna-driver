"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ICONS } from "@/components/constants";
import { FileItem, FolderItem } from "@/types/types";
import { isFolder } from "@/utils/fileCard";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { getProxyUrl } from "@/utils/utils";

interface HeaderProps {
  onSearch: (q: string) => void;
  onNew: () => void;
  onOpenSidebar?: () => void;
  searchResults?: (FileItem | FolderItem)[];
  onOpenResult?: (item: FileItem | FolderItem) => void;
  onSubmitSearch?: (q: string) => void;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  onSearch,
  onNew,
  onOpenSidebar,
  searchResults = [],
  onOpenResult,
  onSubmitSearch,
  onLogout,
}) => {
  const { user, logout } = useCurrentUser();
  const searchContainerRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        open &&
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
      if (
        userMenuOpen &&
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, [open, userMenuOpen]);

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
          <div className="relative" ref={searchContainerRef}>
            <ICONS.Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search corporate drive..."
              onChange={(e) => {
                onSearch(e.target.value);
                setOpen(e.target.value.trim().length > 0);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onSubmitSearch && onSubmitSearch(e.currentTarget.value);
                  setOpen(false);
                }
              }}
              className="w-full h-12 pl-12 pr-4 bg-gray-100 hover:bg-gray-150 focus:bg-white rounded-3xl border border-transparent focus:border-blue-500 focus:outline-none focus:shadow-md transition-all text-base"
            />
            {open && searchResults && searchResults.length > 0 && (
              <div className="absolute left-0 mt-2 w-full bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden z-50">
                <ul className="max-h-80 overflow-y-auto custom-scrollbar">
                  {searchResults.map((item) => {
                    const folder = isFolder(item);
                    const type = folder ? "folder" : (item as FileItem).type;
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => {
                            onOpenResult && onOpenResult(item);
                            setOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition text-left"
                        >
                          <div className="w-9 h-9 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden">
                            {type === "folder" && (
                              <ICONS.Folder className="w-5 h-5 text-blue-600" />
                            )}
                            {type === "image" && (
                              <ICONS.Image className="w-5 h-5 text-rose-600" />
                            )}
                            {type === "video" && (
                              <ICONS.Video className="w-5 h-5 text-purple-600" />
                            )}
                            {type === "link" && (
                              <ICONS.Link className="w-5 h-5 text-amber-600" />
                            )}
                            {type === "file" && (
                              <ICONS.File className="w-5 h-5 text-emerald-600" />
                            )}
                          </div>
                          {!folder && (item as FileItem).thumbnail && (
                            <img
                              src={(item as FileItem).thumbnail!}
                              alt={(item as FileItem).name}
                              className="w-9 h-9 rounded-xl object-cover border border-gray-100"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {item.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {folder ? "Folder" : type.toUpperCase()}
                            </p>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
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
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setUserMenuOpen((v) => !v)}
            className="cursor-pointer w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center text-white font-bold text-sm shadow-md hover:shadow-lg transition overflow-hidden"
          >
            {user?.avatar ? (
              <img
                src={getProxyUrl(user.avatar as string)}
                alt={user.name as string}
                className="w-full h-full object-cover"
              />
            ) : (
              (user?.name as string)?.charAt(0)?.toUpperCase() || "U"
            )}
          </button>
          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 py-1">
              <Link
                href="/profile"
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                onClick={() => setUserMenuOpen(false)}
              >
                <ICONS.User className="w-4 h-4" />
                <span>Hồ sơ cá nhân</span>
              </Link>
              <div className="h-px bg-gray-100 my-1" />
              <button
                type="button"
                onClick={() => {
                  setUserMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition text-left"
              >
                <ICONS.Logout className="w-4 h-4" />
                <span>Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
