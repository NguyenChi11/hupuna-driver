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
    (newType === "folder"
      ? !newName
      : !newName && !newUrl && files.length === 0);

  return (
    <button
      disabled={disabled}
      onClick={handleCreate}
      className="cursor-pointer w-full py-4 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all"
    >
      {isAnalyzing
        ? "Processing..."
        : `Create ${newType === "folder" ? "folder" : newType}`}
    </button>
  );
};
