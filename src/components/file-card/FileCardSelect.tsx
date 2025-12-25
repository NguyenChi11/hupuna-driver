interface FileCardSelectProps {
  isSelected?: boolean;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

const FileCardSelect = ({
  isSelected,
  className = "",
  onClick,
}: FileCardSelectProps) => {
  return (
    <div className={`absolute top-4 left-4 z-10 ${className}`} onClick={onClick}>
      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors cursor-pointer ${
          isSelected
            ? "bg-blue-600 border-blue-600"
            : "border-gray-300 bg-white hover:border-blue-400"
        }`}
      >
        {isSelected && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-3 h-3 text-white"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>
    </div>
  );
};

export default FileCardSelect;
