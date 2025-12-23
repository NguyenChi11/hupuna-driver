import { FileItem, FolderItem } from "@/types/types";

export const INITIAL_FOLDERS: FolderItem[] = [
  {
    id: "f1",
    name: "Marketing Assets",
    parentId: null,
    createdAt: Date.now() - 1000000,
  },
  {
    id: "f2",
    name: "Project Alpha",
    parentId: null,
    createdAt: Date.now() - 2000000,
  },
  {
    id: "f3",
    name: "Legal & HR",
    parentId: null,
    createdAt: Date.now() - 3000000,
  },
  {
    id: "f4",
    name: "Design Sprint Q4",
    parentId: "f1",
    createdAt: Date.now() - 500000,
  },
  { id: "f5", name: "Drafts", parentId: "f2", createdAt: Date.now() - 100000 },
];

export const INITIAL_ITEMS: FileItem[] = [
  {
    id: "i1",
    name: "Brand Guidelines 2025.pdf",
    type: "file",
    parentId: "f1",
    createdAt: Date.now() - 800000,
    description:
      "The official brand voice and visual style guide for the upcoming year.",
    tags: ["branding", "marketing", "guide"],
  },
  {
    id: "i2",
    name: "Product_Demo_Final.mp4",
    type: "video",
    parentId: "f1",
    createdAt: Date.now() - 700000,
    description:
      "High-resolution video demoing the core features of Project Alpha.",
    tags: ["video", "demo", "product"],
  },
  {
    id: "i3",
    name: "Logo_Main_Vector.png",
    type: "image",
    parentId: "f1",
    createdAt: Date.now() - 600000,
    description: "Corporate logo in transparent background.",
    tags: ["design", "assets", "logo"],
  },
  {
    id: "i4",
    name: "Company Dashboard",
    type: "link",
    parentId: null,
    createdAt: Date.now() - 400000,
    url: "https://metabase.company.com",
    description: "Link to internal analytics and metrics.",
    tags: ["analytics", "internal"],
  },
  {
    id: "i5",
    name: "Employment_Contract_Template.docx",
    type: "file",
    parentId: "f3",
    createdAt: Date.now() - 3500000,
    description: "Standard legal template for new hires.",
    tags: ["hr", "legal", "template"],
  },
];
