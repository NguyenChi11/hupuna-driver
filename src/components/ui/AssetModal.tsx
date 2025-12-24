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
  file: File | null;
  setFile: (f: File | null) => void;
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
  file,
  setFile,
  isAnalyzing,
  handleCreate,
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      if (!newName.trim()) {
        setNewName(selectedFile.name);
      }

      const type = selectedFile.type;
      const name = selectedFile.name.toLowerCase();

      if (
        type.startsWith("image/") ||
        /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|tiff)$/.test(name)
      ) {
        setNewType("image");
      } else if (
        type.startsWith("video/") ||
        /\.(mp4|webm|ogg|mov|avi|mkv|wmv|flv|m4v)$/.test(name)
      ) {
        setNewType("video");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-10">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              Create Asset
            </h2>
            <button
              onClick={onClose}
              className="cursor-pointer text-gray-400 hover:text-gray-900 transition-colors"
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
              <label className="block text-[0.875rem] font-black text-gray-400 uppercase tracking-widest mb-3">
                Asset Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: "folder", icon: ICONS.Folder, label: "FOLDER" },
                    { id: "media", icon: ICONS.Image, label: "MEDIA" },
                    { id: "link", icon: ICONS.Link, label: "LINK" },
                    { id: "file", icon: ICONS.File, label: "FILE" },
                  ] as const
                ).map((t) => {
                  const isActive =
                    t.id === "media"
                      ? newType === "image" || newType === "video"
                      : newType === t.id;

                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        if (t.id === "media") {
                          setNewType("image");
                        } else {
                          setNewType(t.id as ItemType | "folder");
                        }
                      }}
                      className={` cursor-pointer flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl border-2 transition-all ${
                        isActive
                          ? "bg-blue-600 border-blue-600 text-white shadow-lg"
                          : "bg-white border-gray-100 text-gray-500 hover:border-blue-100"
                      }`}
                    >
                      <t.icon className="w-5 h-5" />
                      <span className="text-[0.875rem] font-bold uppercase">
                        {t.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[0.875rem] font-black text-gray-400 uppercase tracking-widest mb-2">
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
                <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
                  {newType !== "link" && (
                    <>
                      <div>
                        <label className="block text-[0.875rem] font-black text-gray-400 uppercase tracking-widest mb-2">
                          Upload File
                        </label>
                        <div className="relative group">
                          <input
                            id="file-upload"
                            type="file"
                            onChange={(e) => {
                              handleFileChange(e);
                              if (e.target.files && e.target.files.length > 0) {
                                setNewUrl(""); // Clear URL if file is selected
                              }
                            }}
                            disabled={!!newUrl} // Disable file upload if URL exists
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:uppercase file:tracking-widest file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 transition-all cursor-pointer bg-gray-50 rounded-2xl border border-gray-100 disabled:opacity-50 disabled:cursor-not-allowed pr-10"
                            accept={
                              newType === "image" || newType === "video"
                                ? "image/*,video/*"
                                : "*"
                            }
                          />
                          {file && !newUrl && (
                            <button
                              onClick={() => {
                                setFile(null);
                                const fileInput = document.getElementById(
                                  "file-upload"
                                ) as HTMLInputElement;
                                if (fileInput) fileInput.value = "";
                              }}
                              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-gray-200 hover:bg-red-100 hover:text-red-600 text-gray-500 rounded-full transition-colors"
                              title="Remove selected file"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-4 h-4"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-100"></div>
                        </div>
                        <div className="relative flex justify-center text-[0.875rem] uppercase tracking-widest">
                          <span className="px-2 bg-white text-gray-300 font-black">
                            Or use URL
                          </span>
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-[0.875rem] font-black text-gray-400 uppercase tracking-widest mb-2">
                      {newType === "link"
                        ? "Link / URL"
                        : "Link / URL (Optional)"}
                    </label>
                    <input
                      type="text"
                      value={newUrl}
                      onChange={(e) => {
                        setNewUrl(e.target.value);
                        if (e.target.value) {
                          setFile(null); // Clear file if URL is entered
                          // Reset file input value manually if needed, but react state handling usually suffices for logic
                        }
                      }}
                      disabled={!!file} // Disable URL input if file exists
                      placeholder="https://example.com/file.pdf"
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-300 transition-all text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
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
              disabled={
                isAnalyzing ||
                (newType === "folder" ? !newName : !newName && !newUrl && !file)
              }
              onClick={handleCreate}
              className="cursor-pointer w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-5 rounded-[1.75rem] font-black shadow-xl shadow-blue-100 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 uppercase text-xs tracking-widest"
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
