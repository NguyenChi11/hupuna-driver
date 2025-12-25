import { AssetModalProps } from "@/types/asset";

export const useAssetFile = ({
  files,
  setFiles,
  setNewType,
  setNewName,
  newName,
}: AssetModalProps) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileList = Array.from(e.target.files);
      setFiles(fileList);

      const first = fileList[0];
      if (first.type.startsWith("image/")) setNewType("image");
      else if (first.type.startsWith("video/")) setNewType("video");

      if (fileList.length === 1 && !newName) {
        setNewName(first.name);
      }
    }
  };

  const clearFile = () => setFiles([]);

  return { files, handleFileChange, clearFile };
};
