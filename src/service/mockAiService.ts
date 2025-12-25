import { ItemType } from "@/types/types";

export const analyzeFileAI = async (
  fileName: string,
  type: ItemType
): Promise<{ description: string; tags: string[] }> => {
  return { description: "", tags: [] };
};
