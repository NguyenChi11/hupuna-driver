import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/components/(mongodb)/connectToDatabase";

export const runtime = "nodejs";

const PUBLIC_FOLDER_COLLECTION = "FoldersPublic";

type ItemType = "video" | "image" | "file" | "text";
type Item = {
  id: string;
  type: ItemType;
  name?: string;
  url?: string;
  fileName?: string;
  content?: string;
  updatedAt: number;
};
type FolderNode = {
  id: string;
  name: string;
  parentId?: string;
  children: FolderNode[];
  items: Item[];
  createdAt?: number;
  updatedAt?: number;
};
type GlobalFolderDoc = {
  _id?: string;
  ownerId: string;
  root: FolderNode;
};

function buildOwnerIdQuery(ownerId: string): Record<string, unknown> {
  const variants: unknown[] = [ownerId];
  const num = Number(ownerId);
  if (!Number.isNaN(num)) variants.push(num);
  return { $or: variants.map((v) => ({ ownerId: v })) };
}

function findFolder(root: FolderNode, folderId: string): FolderNode | null {
  if (root.id === folderId) return root;
  for (const child of root.children) {
    const found = findFolder(child, folderId);
    if (found) return found;
  }
  return null;
}

function deleteFolder(root: FolderNode, folderId: string): FolderNode {
  const children = root.children
    .filter((c) => c.id !== folderId)
    .map((c) => deleteFolder(c, folderId));
  return { ...root, children };
}

function renameFolder(
  root: FolderNode,
  folderId: string,
  name: string
): FolderNode {
  if (root.id === folderId) return { ...root, name };
  return {
    ...root,
    children: root.children.map((c) => renameFolder(c, folderId, name)),
  };
}

function upsertItemInFolder(folder: FolderNode, input: Item): FolderNode {
  const idx = folder.items.findIndex((x) => x.id === input.id);
  const items = [...folder.items];
  if (idx >= 0) items[idx] = input;
  else items.push(input);
  return { ...folder, items };
}

function updateFolderById(
  root: FolderNode,
  folderId: string,
  updater: (f: FolderNode) => FolderNode
): FolderNode {
  if (root.id === folderId) return updater(root);
  return {
    ...root,
    children: root.children.map((c) => updateFolderById(c, folderId, updater)),
  };
}

function simpleFingerprint(headers: Headers): string {
  const ua = headers.get("user-agent") || "";
  const lang = headers.get("accept-language") || "";
  const str = ua + lang;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

async function resolveOwnerId(
  req: NextRequest,
  fallback?: string
): Promise<string> {
  const provided = String(fallback || "").trim();
  if (provided) return provided;

  // NOTE: This is a simplified version because the original auth libraries are missing.
  // We use a simple fingerprint of user-agent and accept-language.
  const fp = simpleFingerprint(req.headers);
  return `anon:${fp}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = String(body.action || "").trim();
    const ownerIdInput = String(body.ownerId || "").trim();
    if (!action)
      return NextResponse.json({ error: "Missing action" }, { status: 400 });

    const ownerId = await resolveOwnerId(req, ownerIdInput);

    const { db } = await connectToDatabase();
    const collection = db.collection<GlobalFolderDoc>(PUBLIC_FOLDER_COLLECTION);

    const toUiFolder = (
      n: FolderNode
    ): {
      id: string;
      name: string;
      children: Array<{ id: string; name: string; children: unknown[] }>;
    } => ({
      id: n.id,
      name: n.name,
      children: n.children.map(toUiFolder),
    });
    const buildItemsMap = (
      root: FolderNode
    ): Record<
      string,
      Array<{
        id: string;
        content?: string;
        type?: "image" | "video" | "file" | "text";
        fileUrl?: string;
        fileName?: string;
      }>
    > => {
      const acc: Record<
        string,
        Array<{
          id: string;
          content?: string;
          type?: "image" | "video" | "file" | "text";
          fileUrl?: string;
          fileName?: string;
        }>
      > = {};
      const walk = (node: FolderNode) => {
        acc[node.id] = node.items.map((it) => ({
          id: it.id,
          content: it.content,
          type: it.type,
          fileUrl: it.url,
          fileName: it.fileName,
        }));
        node.children.forEach(walk);
      };
      walk(root);
      return acc;
    };

    switch (action) {
      case "read": {
        const row = await collection.findOne(buildOwnerIdQuery(ownerId));
        if (!row) {
          const now = Date.now();
          const root: FolderNode = {
            id: "root",
            name: "root",
            parentId: undefined,
            children: [],
            items: [],
            createdAt: now,
          };
          return NextResponse.json({
            success: true,
            data: { ownerId, root },
            folders: root.children.map(toUiFolder),
            itemsMap: buildItemsMap(root),
          });
        }
        return NextResponse.json({
          success: true,
          data: row,
          folders: row.root.children.map(toUiFolder),
          itemsMap: buildItemsMap(row.root),
        });
      }
      case "createFolder": {
        const parentId = String(body.parentId || "root").trim();
        const name = String(body.name || "").trim();
        if (!name)
          return NextResponse.json({ error: "Missing name" }, { status: 400 });

        const existing = await collection.findOne(buildOwnerIdQuery(ownerId));
        const now = Date.now();
        const baseRoot: FolderNode = existing?.root || {
          id: "root",
          name: "root",
          parentId: undefined,
          children: [],
          items: [],
          createdAt: now,
        };
        const parent = findFolder(baseRoot, parentId);
        if (!parent)
          return NextResponse.json(
            { error: "Parent folder not found" },
            { status: 404 }
          );
        const newId = `f-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`;
        const nextRoot = updateFolderById(baseRoot, parentId, (f) => ({
          ...f,
          updatedAt: now,
          children: [
            ...f.children,
            {
              id: newId,
              name,
              parentId,
              children: [],
              items: [],
              createdAt: now,
              updatedAt: now,
            },
          ],
        }));

        await collection.updateOne(
          buildOwnerIdQuery(ownerId),
          { $set: { ownerId, root: nextRoot } },
          { upsert: true }
        );
        return NextResponse.json({
          success: true,
          folder: { id: newId, name, parentId },
          folders: nextRoot.children.map(toUiFolder),
          itemsMap: buildItemsMap(nextRoot),
        });
      }
      case "renameFolder": {
        const folderId = String(body.folderId || "").trim();
        const name = String(body.name || "").trim();
        if (!folderId || !name)
          return NextResponse.json(
            { error: "Missing folderId or name" },
            { status: 400 }
          );

        const existing = await collection.findOne(buildOwnerIdQuery(ownerId));
        const now = Date.now();
        const baseRoot: FolderNode = existing?.root || {
          id: "root",
          name: "root",
          parentId: undefined,
          children: [],
          items: [],
          createdAt: now,
        };
        const nextRoot = renameFolder(baseRoot, folderId, name);
        const nextRootWithTs = updateFolderById(nextRoot, folderId, (f) => ({
          ...f,
          updatedAt: now,
        }));

        await collection.updateOne(
          buildOwnerIdQuery(ownerId),
          { $set: { ownerId, root: nextRootWithTs } },
          { upsert: true }
        );
        return NextResponse.json({
          success: true,
          folders: nextRootWithTs.children.map(toUiFolder),
          itemsMap: buildItemsMap(nextRootWithTs),
        });
      }
      case "deleteFolder": {
        const folderId = String(body.folderId || "").trim();
        if (!folderId)
          return NextResponse.json(
            { error: "Missing folderId" },
            { status: 400 }
          );

        const existing = await collection.findOne(buildOwnerIdQuery(ownerId));
        const now = Date.now();
        const baseRoot: FolderNode = existing?.root || {
          id: "root",
          name: "root",
          parentId: undefined,
          children: [],
          items: [],
          createdAt: now,
        };
        const nextRoot = updateFolderById(
          deleteFolder(baseRoot, folderId),
          "root",
          (f) => ({ ...f, updatedAt: now })
        );

        await collection.updateOne(
          buildOwnerIdQuery(ownerId),
          { $set: { ownerId, root: nextRoot } },
          { upsert: true }
        );
        return NextResponse.json({
          success: true,
          folders: nextRoot.children.map(toUiFolder),
          itemsMap: buildItemsMap(nextRoot),
        });
      }
      case "listItems": {
        const folderId = String(body.folderId || "").trim();
        if (!folderId)
          return NextResponse.json(
            { error: "Missing folderId" },
            { status: 400 }
          );

        const existing = await collection.findOne(buildOwnerIdQuery(ownerId));
        const baseRoot: FolderNode = existing?.root || {
          id: "root",
          name: "root",
          parentId: undefined,
          children: [],
          items: [],
          createdAt: Date.now(),
        };
        const folder = findFolder(baseRoot, folderId);
        if (!folder)
          return NextResponse.json(
            { error: "Folder not found" },
            { status: 404 }
          );
        return NextResponse.json({
          success: true,
          items: folder.items.map((it) => ({
            id: it.id,
            name: it.name,
            content: it.content,
            type: it.type,
            fileUrl: it.url,
            fileName: it.fileName,
          })),
        });
      }
      case "upsertItem":
      case "updateText":
      case "updateImage":
      case "updateVideo":
      case "updateFile": {
        const folderId = String(body.folderId || "").trim();
        const itemId =
          String(body.itemId || "").trim() ||
          `i-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const type: ItemType = (
          action === "upsertItem"
            ? String(body.type || "").trim()
            : (action.replace("update", "").toLowerCase() as ItemType)
        ) as ItemType;
        if (!folderId || !type)
          return NextResponse.json(
            { error: "Missing folderId or type" },
            { status: 400 }
          );
        const name = typeof body.name === "string" ? body.name : undefined;
        const url = typeof body.url === "string" ? body.url : undefined;
        const fileName =
          typeof body.fileName === "string" ? body.fileName : undefined;
        const content =
          typeof body.content === "string" ? body.content : undefined;

        const existing = await collection.findOne(buildOwnerIdQuery(ownerId));
        const now = Date.now();
        const baseRoot: FolderNode = existing?.root || {
          id: "root",
          name: "root",
          parentId: undefined,
          children: [],
          items: [],
          createdAt: now,
        };
        const folder = findFolder(baseRoot, folderId);
        if (!folder)
          return NextResponse.json(
            { error: "Folder not found" },
            { status: 404 }
          );

        const nextItem: Item = {
          id: itemId,
          type,
          name,
          url,
          fileName,
          content,
          updatedAt: Date.now(),
        };
        const nextRoot = updateFolderById(baseRoot, folderId, (f) => ({
          ...upsertItemInFolder(f, nextItem),
          updatedAt: now,
        }));

        await collection.updateOne(
          buildOwnerIdQuery(ownerId),
          { $set: { ownerId, root: nextRoot } },
          { upsert: true }
        );
        const updatedFolder = findFolder(nextRoot, folderId)!;
        return NextResponse.json({
          success: true,
          item: nextItem,
          items: updatedFolder.items.map((it) => ({
            id: it.id,
            name: it.name,
            content: it.content,
            type: it.type,
            fileUrl: it.url,
            fileName: it.fileName,
          })),
        });
      }
      case "deleteItem": {
        const folderId = String(body.folderId || "").trim();
        const itemId = String(body.itemId || "").trim();
        if (!folderId || !itemId)
          return NextResponse.json(
            { error: "Missing folderId or itemId" },
            { status: 400 }
          );

        const existing = await collection.findOne(buildOwnerIdQuery(ownerId));
        const now = Date.now();
        const baseRoot: FolderNode = existing?.root || {
          id: "root",
          name: "root",
          parentId: undefined,
          children: [],
          items: [],
          createdAt: now,
        };
        const folder = findFolder(baseRoot, folderId);
        if (!folder)
          return NextResponse.json(
            { error: "Folder not found" },
            { status: 404 }
          );

        const nextRoot = updateFolderById(baseRoot, folderId, (f) => ({
          ...f,
          items: f.items.filter((x) => x.id !== itemId),
          updatedAt: now,
        }));

        await collection.updateOne(
          buildOwnerIdQuery(ownerId),
          { $set: { ownerId, root: nextRoot } },
          { upsert: true }
        );
        const updatedFolder = findFolder(nextRoot, folderId)!;
        return NextResponse.json({
          success: true,
          items: updatedFolder.items.map((it) => ({
            id: it.id,
            name: it.name,
            content: it.content,
            type: it.type,
            fileUrl: it.url,
            fileName: it.fileName,
          })),
        });
      }
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
