import { useEffect, useMemo, useState } from "react";
import { useAssetFile } from "@/hooks/useAssetFile";
import { AssetFormProps } from "@/types/asset";

export const AssetForm = (props: AssetFormProps) => {
  const { newType, newName, setNewName, newUrl, setNewUrl, setFiles } = props;

  const { files, handleFileChange, clearFile } = useAssetFile(props);

  const [previewModal, setPreviewModal] = useState<{
    url: string;
    type: string;
  } | null>(null);

  const [sourceMode, setSourceMode] = useState<"upload" | "url">("upload");
  const showNameInput =
    newType === "folder" || newType === "link" || sourceMode === "url";

  useEffect(() => {
    if (newType === "link" && files.length > 0) clearFile();
  }, [newType, files, clearFile]);

  useEffect(() => {
    if (files.length > 0) setNewUrl("");
  }, [files, setNewUrl]);

  const accept =
    newType === "image" || newType === "video" ? "image/*,video/*" : undefined;

  const previewUrls = useMemo(() => {
    return files.map((file) => {
      if (newType === "image" || newType === "video") {
        return { url: URL.createObjectURL(file), type: file.type };
      }
      return null;
    });
  }, [files, newType]);

  useEffect(() => {
    return () => {
      previewUrls.forEach((p) => p?.url && URL.revokeObjectURL(p.url));
    };
  }, [previewUrls]);

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  return (
    <div className="space-y-6">
      {/* Full-screen preview modal */}
      {previewModal && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-8"
          onClick={() => setPreviewModal(null)}
        >
          <button
            onClick={() => setPreviewModal(null)}
            className="absolute top-8 right-8 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur transition"
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {previewModal.type.startsWith("image/") ? (
            <img
              src={previewModal.url}
              alt="Preview"
              className="max-w-full max-h-full object-contain rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <video
              src={previewModal.url}
              controls
              autoPlay
              className="max-w-full max-h-full rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
      )}

      {/* Name input */}
      {showNameInput && (
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Enter name"
          className="w-full px-5 py-4 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-base"
        />
      )}

      {/* Upload vs URL toggle (except folder & link) */}
      {newType !== "folder" && newType !== "link" && (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              setSourceMode("upload");
              setNewUrl("");
            }}
            className={`cursor-pointer py-3 rounded-xl font-medium transition-all ${
              sourceMode === "upload"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Upload file
          </button>
          <button
            onClick={() => {
              setSourceMode("url");
              if (files.length > 0) clearFile();
            }}
            className={`cursor-pointer py-3 rounded-xl font-medium transition-all ${
              sourceMode === "url"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Use link
          </button>
        </div>
      )}

      {/* Upload area */}
      {newType !== "folder" &&
        newType !== "link" &&
        sourceMode === "upload" && (
          <label className="block">
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-all">
              <div className="text-gray-600 font-medium">
                Drop files here or{" "}
                <span className="text-blue-600 underline">browse</span>
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {files.length > 0
                  ? `${files.length} file(s) selected`
                  : "Images, videos, or any files"}
              </div>
            </div>
            <input
              type="file"
              className="hidden"
              accept={accept}
              multiple
              onChange={handleFileChange}
            />
          </label>
        )}

      {/* Uploaded files preview */}
      {files.length > 0 && sourceMode === "upload" && (
        <div className="grid grid-cols-4 gap-4">
          {previewUrls.map((preview, index) =>
            preview ? (
              <div key={index} className="relative group">
                <div
                  className="aspect-square rounded-xl overflow-hidden border border-gray-200 cursor-pointer shadow-sm hover:shadow-md transition-all"
                  onClick={() => setPreviewModal(preview)}
                >
                  {preview.type.startsWith("image/") ? (
                    <img
                      src={preview.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={preview.url}
                      muted
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <svg
                      className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-700 hover:bg-red-500 hover:text-white transition-all"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div
                key={index}
                className="aspect-square bg-gray-100 rounded-xl border border-gray-300 flex items-center justify-center p-2 relative"
              >
                <span className="text-xs text-gray-600 text-center truncate w-full px-2">
                  {files[index].name}
                </span>
                <button
                  onClick={() => removeFile(index)}
                  className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-700 hover:bg-red-500 hover:text-white"
                >
                  ✕
                </button>
              </div>
            )
          )}
        </div>
      )}

      {/* URL input */}
      {(newType === "link" || sourceMode === "url") && (
        <input
          type="url"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          placeholder="https://example.com"
          className="w-full px-5 py-4 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-base"
        />
      )}
    </div>
  );
};
