import { getIconByType, getColorClasses } from "@/utils/fileCard";

export const FileCardIcon = ({
  type,
  children,
}: {
  type: string;
  children?: React.ReactNode;
}) => {
  const Icon = getIconByType(type);
  const bg = getColorClasses(type).split(" ").slice(0, 2).join(" ");

  return (
    <div className={`p-4 rounded-2xl ${bg} flex justify-between items-start`}>
      <Icon className="w-8 h-8" />
      {children}
    </div>
  );
};
