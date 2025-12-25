import { AssetSubmitProps } from "@/types/asset";

export const AssetSubmitButton = ({
  newType,
  newName,
  newUrl,
  files,
  isAnalyzing,
  handleCreate,
}: AssetSubmitProps) => {
  const disabled =
    isAnalyzing ||
    (newType === "folder" ? !newName : !newName && !newUrl && files.length === 0);

  return (
    <button
      disabled={disabled}
      onClick={handleCreate}
      className="w-full bg-blue-600 text-white py-5 rounded-xl font-black disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isAnalyzing ? "Processing..." : `Create ${newType}`}
    </button>
  );
};
