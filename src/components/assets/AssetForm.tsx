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
      previewUrls.forEach((p) => {
        if (p?.url) URL.revokeObjectURL(p.url);
      });
    };
  }, [previewUrls]);

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  return (
    <div className="space-y-4">
      {previewModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setPreviewModal(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full flex items-center justify-center">
            <button
              onClick={() => setPreviewModal(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
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
                className="max-w-full max-h-[85vh] rounded-lg shadow-2xl object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <video
                src={previewModal.url}
                controls
                autoPlay
                className="max-w-full max-h-[85vh] rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </div>
        </div>
      )}

      {showNameInput && (
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Display name"
          className="w-full rounded-2xl px-5 py-4 bg-gray-50"
        />
      )}

      {newType !== "folder" && (
        <div className="space-y-3">
          {newType !== "link" && (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setSourceMode("upload");
                  setNewUrl("");
                }}
                className={`rounded-2xl py-2 border-2 ${
                  sourceMode === "upload"
                    ? "bg-blue-600 text-white"
                    : "border-gray-100"
                }`}
              >
                Upload
              </button>
              <button
                onClick={() => {
                  setSourceMode("url");
                  if (files.length > 0) clearFile();
                }}
                className={`rounded-2xl py-2 border-2 ${
                  sourceMode === "url"
                    ? "bg-blue-600 text-white"
                    : "border-gray-100"
                }`}
              >
                Dùng link
              </button>
            </div>
          )}

          {newType !== "link" && sourceMode === "upload" && (
            <div className="flex items-center gap-3">
              <label className="flex-1">
                <div className="w-full rounded-2xl px-5 py-2 bg-gray-50 border-2 border-gray-100 text-center cursor-pointer">
                  <div className="text-sm font-bold">
                    Chọn tệp ({files.length})
                  </div>
                  <div className="text-xs text-gray-500">
                    {newType === "image" || newType === "video"
                      ? "Ảnh/Video"
                      : "Bất kỳ tệp"}
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
            </div>
          )}

          {files.length > 0 && sourceMode === "upload" && (
            <div className="flex flex-wrap gap-2">
              {previewUrls.map((preview, index) =>
                preview ? (
                  <div key={index} className="relative w-24 h-24 group">
                    <div
                      className="relative inline-block w-24 h-24 rounded-xl border-2 border-gray-100 overflow-hidden bg-gray-50 cursor-pointer transition-transform hover:scale-105"
                      onClick={() => setPreviewModal(preview)}
                    >
                      {preview.type.startsWith("image/") ? (
                        <img
                          src={preview.url}
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <video
                          src={preview.url}
                          muted
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                          />
                        </svg>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute -top-1 -right-1 rounded-full w-6 h-6 bg-gray-800 text-white flex items-center justify-center shadow z-10 hover:bg-red-600 transition-colors"
                      title="Xóa tệp"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div
                    key={index}
                    className="relative w-24 h-24 flex items-center justify-center bg-gray-100 rounded-xl border-2 border-gray-200"
                  >
                    <span className="text-xs text-gray-500 p-1 text-center truncate w-full">
                      {files[index].name}
                    </span>
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute -top-1 -right-1 rounded-full w-6 h-6 bg-gray-800 text-white flex items-center justify-center shadow z-10"
                      title="Xóa tệp"
                    >
                      ✕
                    </button>
                  </div>
                )
              )}
            </div>
          )}

          {(newType === "link" || sourceMode === "url") && (
            <input
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-2xl px-5 py-4 bg-gray-50"
            />
          )}
        </div>
      )}
    </div>
  );
};
