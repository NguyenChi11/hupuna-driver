import { ItemType } from "./types";

export interface AssetModalProps {
  onClose: () => void;
  newType: ItemType | "folder";
  setNewType: (t: ItemType | "folder") => void;
  newName: string;
  setNewName: (n: string) => void;
  newUrl: string;
  setNewUrl: (u: string) => void;
  files: File[];
  setFiles: (f: File[]) => void;
  isAnalyzing: boolean;
  handleCreate: () => void;
}

export type AssetTypeSelectorProps = Pick<
  AssetModalProps,
  "newType" | "setNewType"
>;

export type AssetFormProps = AssetModalProps;
export type AssetSubmitProps = AssetModalProps;
