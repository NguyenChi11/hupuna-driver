import React from "react";
import { ICONS } from "@/components/constants";
import { ItemType } from "@/types/types";

interface AssetModalProps {
  onClose: () => void;
  newType: ItemType | "folder";
  setNewType: (t: ItemType | "folder") => void;
  newName: string;
  setNewName: (n: string) => void;
  newUrl: string;
  setNewUrl: (u: string) => void;
  isAnalyzing: boolean;
  handleCreate: () => void;
}

const AssetModal: React.FC<AssetModalProps> = ({
  onClose,
  newType,
  setNewType,
  newName,
  setNewName,
  newUrl,
  setNewUrl,
  isAnalyzing,
  handleCreate,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-10">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              Create Asset
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-900 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                Asset Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: "folder", icon: ICONS.Folder },
                    { id: "image", icon: ICONS.Image },
                    { id: "video", icon: ICONS.Video },
                    { id: "link", icon: ICONS.Link },
                    { id: "file", icon: ICONS.File },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setNewType(t.id)}
                    className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl border-2 transition-all ${
                      newType === t.id
                        ? "bg-blue-600 border-blue-600 text-white shadow-lg"
                        : "bg-white border-gray-100 text-gray-500 hover:border-blue-100"
                    }`}
                  >
                    <t.icon className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase">
                      {t.id}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Folder name or File name..."
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-300 transition-all text-sm font-bold"
                />
              </div>
              {newType !== "folder" && (
                <div className="animate-in slide-in-from-bottom-2 duration-300">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                    Link / URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="https://example.com/file.pdf"
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-300 transition-all text-sm font-bold"
                  />
                </div>
              )}
            </div>

            {isAnalyzing && (
              <div className="flex items-center justify-center gap-3 py-2 text-blue-600 text-xs font-bold animate-pulse">
                <ICONS.Ai className="w-5 h-5" />
                <span>Gemini AI is analyzing content...</span>
              </div>
            )}

            <button
              disabled={!newName || isAnalyzing}
              onClick={handleCreate}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-5 rounded-[28px] font-black shadow-xl shadow-blue-100 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 uppercase text-xs tracking-widest"
            >
              {isAnalyzing ? "Processing..." : `Create ${newType}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetModal;
