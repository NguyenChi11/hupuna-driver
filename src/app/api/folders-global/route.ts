import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/components/(mongodb)/connectToDatabase";
import { Storage } from "megajs";

export const runtime = "nodejs";

const GLOBAL_COLLECTION = "GlobalDrive";

type ItemType = "video" | "image" | "file" | "text";
type Item = {
  id: string;
  type: ItemType;
  name?: string;
  url?: string;
  fileName?: string;
  content?: string;
  authorId?: string;
  authorName?: string;
  authorAvatar?: string;
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
  authorId?: string;
  authorName?: string;
  authorAvatar?: string;
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

function genId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function uploadToMegaInline(
  fileBuffer: Buffer,
  originalFileName: string,
  fileSize: number,
  subFolderName: string
) {
  const pickCreds = (ownerKey: string) => {
    const baseEmail = (process.env.MEGA_EMAIL || "").trim();
    const basePassword = (process.env.MEGA_PASSWORD || "").trim();
    const emails: string[] = [];
    const passwords: string[] = [];
    for (let i = 1; i <= 5; i++) {
      const e = (process.env[`MEGA_EMAIL_${i}`] || "").trim();
      const p = (process.env[`MEGA_PASSWORD_${i}`] || "").trim();
      if (e && p) {
        emails.push(e);
        passwords.push(p);
      }
    }
    if (!emails.length && baseEmail && basePassword) {
      return { email: baseEmail, password: basePassword };
    }
    if (emails.length) {
      let hash = 0;
      for (let i = 0; i < ownerKey.length; i++) {
        hash = (hash << 5) - hash + ownerKey.charCodeAt(i);
        hash |= 0;
      }
      const idx = Math.abs(hash) % emails.length;
      return { email: emails[idx], password: passwords[idx] };
    }
    return { email: baseEmail, password: basePassword };
  };
  const creds = pickCreds(subFolderName);
  const email = creds.email;
  const password = creds.password;
  const masterFolder = (process.env.MASTER_FOLDER_NAME || "Uploads").trim();
  if (!email || !password) {
    throw new Error("Missing MEGA_EMAIL/MEGA_PASSWORD");
  }
  const storage = new Storage({ email, password });
  const ready = new Promise<void>((resolve, reject) => {
    storage.on("ready", () => resolve());
    storage.on("error" as never, (err) => reject(err));
  });
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Mega login timeout")), 15000)
  );
  await Promise.race([ready, timeout]);
  let master = storage.root.children?.find(
    (n) => n.name === masterFolder && n.directory
  );
  if (!master) master = await storage.mkdir(masterFolder);
  const safeSub =
    subFolderName && subFolderName.trim() ? subFolderName.trim() : "Default";
  let target = master.children?.find((n) => n.name === safeSub && n.directory);
  if (!target) target = await master.mkdir(safeSub);

  const name = originalFileName?.trim() || `file_${Date.now()}`;
  const task = target.upload({ name, size: fileSize }, fileBuffer);
  const link = await new Promise<string>((resolve, reject) => {
    task.on(
      "complete",
      (uploadedFile: {
        link: (
          isPublic: boolean,
          cb: (err: Error | null, url: string) => void
        ) => void;
      }) => {
        uploadedFile.link(false, (err, url) => {
          if (err) reject(err);
          else resolve(url);
        });
      }
    );
    task.on("error", (err: Error) => reject(err));
  });
  return { link, fileName: name, folderPath: `${masterFolder}/${safeSub}` };
}

export async function POST(req: NextRequest) {
  try {
    const ct = req.headers.get("content-type") || "";
    // Multipart upload path for global items -> push to Mega and save adjacency item
    if (ct.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file") as unknown;
      const typeRaw = String(form.get("type") || "file").trim();
      const folderId = String(form.get("folderId") || "root").trim();
      const ownerId = await resolveOwnerId(
        req,
        String(form.get("ownerId") || "").trim()
      );
      const isValidFile =
        file &&
        typeof (file as { arrayBuffer?: () => Promise<ArrayBuffer> })
          .arrayBuffer === "function" &&
        typeof (file as { name?: string }).name === "string";
      if (!isValidFile) {
        return NextResponse.json({ error: "Missing file" }, { status: 400 });
      }
      const arrayBuffer = await (
        file as { arrayBuffer: () => Promise<ArrayBuffer> }
      ).arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const { db } = await connectToDatabase();
      const subFolderName = `global-${ownerId}-${folderId}`;
      let uploadRes: {
        link: string;
        fileName: string;
        folderPath: string;
      } | null = null;
      try {
        uploadRes = await uploadToMegaInline(
          buffer,
          (file as { name: string }).name,
          buffer.length,
          subFolderName
        );
      } catch (e) {
        return NextResponse.json(
          {
            success: false,
            message: (e as Error)?.message || "Mega upload failed",
          },
          { status: 500 }
        );
      }
      const items = db.collection(GLOBAL_COLLECTION);
      const itemId = genId("i");
      const now = Date.now();
      const authorId = String(form.get("authorId") || ownerId);
      const authorName =
        typeof form.get("authorName") === "string"
          ? (form.get("authorName") as string)
          : undefined;
      const authorAvatar =
        typeof form.get("authorAvatar") === "string"
          ? (form.get("authorAvatar") as string)
          : undefined;
      await items.insertOne({
        ownerId,
        id: itemId,
        folderId,
        type: ["image", "video", "file", "text"].includes(typeRaw)
          ? typeRaw
          : "file",
        name: (file as { name: string }).name,
        fileName: (file as { name: string }).name,
        fileUrl: uploadRes.link,
        authorId,
        authorName,
        authorAvatar,
        createdAt: now,
        updatedAt: now,
      });
      return NextResponse.json({
        success: true,
        link: uploadRes.link,
        item: {
          id: itemId,
          name: (file as { name: string }).name,
          type: typeRaw,
          fileUrl: uploadRes.link,
          fileName: (file as { name: string }).name,
          authorId,
          authorName,
          authorAvatar,
        },
      });
    }

    const body = await req.json();
    const action = String(body.action || "").trim();
    const ownerIdInput = String(body.ownerId || "").trim();
    if (!action)
      return NextResponse.json({ error: "Missing action" }, { status: 400 });

    const ownerId = await resolveOwnerId(req, ownerIdInput);

    const { db } = await connectToDatabase();
    const collection = db.collection<GlobalFolderDoc>(GLOBAL_COLLECTION);
    // Aliases for clarity, though they point to the same collection
    const adjFolders = db.collection(GLOBAL_COLLECTION);
    const adjItems = db.collection(GLOBAL_COLLECTION);

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
      case "adjacencyRead": {
        const parentId = String(body.parentId || "root").trim();
        const recursive = !!body.recursive;

        const folderQuery: Record<string, unknown> = {
          ...buildOwnerIdQuery(ownerId),
          trashedAt: { $exists: false },
          type: { $exists: false },
        };
        const itemQuery: Record<string, unknown> = {
          ...buildOwnerIdQuery(ownerId),
          trashedAt: { $exists: false },
          type: { $in: ["image", "video", "file", "text"] },
        };

        if (!recursive) {
          folderQuery.parentId = parentId;
          itemQuery.folderId = parentId;
        }

        const folders = await adjFolders
          .find(folderQuery)
          .project({
            _id: 0,
            id: 1,
            name: 1,
            parentId: 1,
            authorId: 1,
            authorName: 1,
            authorAvatar: 1,
          })
          .toArray();
        const items = await adjItems
          .find(itemQuery)
          .project({
            _id: 0,
            id: 1,
            name: 1,
            type: 1,
            fileUrl: 1,
            fileName: 1,
            folderId: 1,
            authorId: 1,
            authorName: 1,
            authorAvatar: 1,
          })
          .toArray();
        return NextResponse.json({
          success: true,
          folders,
          items,
        });
      }
      case "adjacencyReadTrash": {
        const folders = await adjFolders
          .find({
            ...buildOwnerIdQuery(ownerId),
            trashedAt: { $exists: true },
            type: { $exists: false },
          })
          .project({
            _id: 0,
            id: 1,
            name: 1,
            parentId: 1,
            trashedAt: 1,
            authorId: 1,
            authorName: 1,
            authorAvatar: 1,
          })
          .toArray();
        const items = await adjItems
          .find({
            ...buildOwnerIdQuery(ownerId),
            trashedAt: { $exists: true },
            type: { $in: ["image", "video", "file", "text"] },
          })
          .project({
            _id: 0,
            id: 1,
            name: 1,
            type: 1,
            fileUrl: 1,
            fileName: 1,
            folderId: 1,
            trashedAt: 1,
            authorId: 1,
            authorName: 1,
            authorAvatar: 1,
          })
          .toArray();
        return NextResponse.json({ success: true, folders, items });
      }
      case "adjacencyCreateFolder": {
        const name = String(body.name || "").trim();
        const parentId = String(body.parentId || "root").trim();
        if (!name)
          return NextResponse.json({ error: "Missing name" }, { status: 400 });
        const id = genId("f");
        const now = Date.now();
        const authorId = String(body.authorId || ownerId);
        const authorName =
          typeof body.authorName === "string" ? body.authorName : undefined;
        const authorAvatar =
          typeof body.authorAvatar === "string" ? body.authorAvatar : undefined;
        await adjFolders.insertOne({
          ownerId,
          id,
          name,
          parentId,
          authorId,
          authorName,
          authorAvatar,
          createdAt: now,
          updatedAt: now,
        });
        return NextResponse.json({
          success: true,
          folder: { id, name, parentId, authorId, authorName, authorAvatar },
        });
      }
      case "adjacencyTrashFolder": {
        const folderId = String(body.folderId || "").trim();
        if (!folderId)
          return NextResponse.json(
            { error: "Missing folderId" },
            { status: 400 }
          );
        const now = Date.now();
        await adjFolders.updateOne(
          { ...buildOwnerIdQuery(ownerId), id: folderId },
          { $set: { trashedAt: now, updatedAt: now } }
        );
        return NextResponse.json({ success: true });
      }
      case "adjacencyTrashItem": {
        const itemId = String(body.itemId || "").trim();
        if (!itemId)
          return NextResponse.json(
            { error: "Missing itemId" },
            { status: 400 }
          );
        const now = Date.now();
        await adjItems.updateOne(
          { ...buildOwnerIdQuery(ownerId), id: itemId },
          { $set: { trashedAt: now, updatedAt: now } }
        );
        return NextResponse.json({ success: true });
      }
      case "adjacencyRestoreFolder": {
        const folderId = String(body.folderId || "").trim();
        if (!folderId)
          return NextResponse.json(
            { error: "Missing folderId" },
            { status: 400 }
          );
        await adjFolders.updateOne(
          { ...buildOwnerIdQuery(ownerId), id: folderId },
          { $unset: { trashedAt: "" } }
        );
        return NextResponse.json({ success: true });
      }
      case "adjacencyRestoreItem": {
        const itemId = String(body.itemId || "").trim();
        if (!itemId)
          return NextResponse.json(
            { error: "Missing itemId" },
            { status: 400 }
          );
        await adjItems.updateOne(
          { ...buildOwnerIdQuery(ownerId), id: itemId },
          { $unset: { trashedAt: "" } }
        );
        return NextResponse.json({ success: true });
      }
      case "adjacencyPermanentDeleteItem": {
        const itemId = String(body.itemId || "").trim();
        if (!itemId)
          return NextResponse.json(
            { error: "Missing itemId" },
            { status: 400 }
          );
        await adjItems.deleteOne({ ...buildOwnerIdQuery(ownerId), id: itemId });
        return NextResponse.json({ success: true });
      }
      case "adjacencyPermanentDeleteFolder": {
        const folderId = String(body.folderId || "").trim();
        if (!folderId)
          return NextResponse.json(
            { error: "Missing folderId" },
            { status: 400 }
          );
        // Collect all descendant folders
        const allFolderIds: string[] = [folderId];
        while (true) {
          const children = await adjFolders
            .find({
              ...buildOwnerIdQuery(ownerId),
              parentId: { $in: allFolderIds },
            })
            .project({ _id: 0, id: 1 })
            .toArray();
          const newIds = children
            .map((c) => c.id)
            .filter((id) => !allFolderIds.includes(id));
          if (newIds.length === 0) break;
          allFolderIds.push(...newIds);
        }
        // Delete items in all folders
        await adjItems.deleteMany({
          ...buildOwnerIdQuery(ownerId),
          folderId: { $in: allFolderIds },
        });
        // Delete folders
        await adjFolders.deleteMany({
          ...buildOwnerIdQuery(ownerId),
          id: { $in: allFolderIds },
        });
        return NextResponse.json({
          success: true,
          deletedFolderIds: allFolderIds,
        });
      }
      case "adjacencyUpsertItem": {
        const folderId = String(body.folderId || "root").trim();
        const itemId = String(body.itemId || genId("i")).trim();
        const type = String(body.type || "file").trim();
        const name = typeof body.name === "string" ? body.name : undefined;
        const url = typeof body.url === "string" ? body.url : undefined;
        const fileName =
          typeof body.fileName === "string" ? body.fileName : name;
        if (!folderId || !type)
          return NextResponse.json(
            { error: "Missing folderId or type" },
            { status: 400 }
          );
        const now = Date.now();
        await adjItems.updateOne(
          { ownerId, id: itemId },
          {
            $set: {
              ownerId,
              id: itemId,
              folderId,
              type: ["image", "video", "file", "text"].includes(type)
                ? type
                : "file",
              name,
              fileUrl: url,
              fileName,
              authorId: String(body.authorId || ownerId),
              authorName:
                typeof body.authorName === "string"
                  ? body.authorName
                  : undefined,
              authorAvatar:
                typeof body.authorAvatar === "string"
                  ? body.authorAvatar
                  : undefined,
              updatedAt: now,
            },
            $setOnInsert: { createdAt: now },
          },
          { upsert: true }
        );
        const saved = await adjItems.findOne(
          { ownerId, id: itemId },
          {
            projection: {
              _id: 0,
              id: 1,
              name: 1,
              type: 1,
              fileUrl: 1,
              fileName: 1,
              authorId: 1,
              authorName: 1,
              authorAvatar: 1,
            },
          }
        );
        return NextResponse.json({ success: true, item: saved });
      }
      case "adjacencyRenameFolder": {
        const folderId = String(body.folderId || "").trim();
        const name = String(body.name || "").trim();
        if (!folderId || !name)
          return NextResponse.json(
            { error: "Missing folderId or name" },
            { status: 400 }
          );
        await adjFolders.updateOne(
          { ...buildOwnerIdQuery(ownerId), id: folderId },
          { $set: { name, updatedAt: Date.now() } }
        );
        return NextResponse.json({ success: true });
      }
      case "adjacencyRenameItem": {
        const itemId = String(body.itemId || "").trim();
        const name = String(body.name || "").trim();
        if (!itemId || !name)
          return NextResponse.json(
            { error: "Missing itemId or name" },
            { status: 400 }
          );
        await adjItems.updateOne(
          { ...buildOwnerIdQuery(ownerId), id: itemId },
          { $set: { name, updatedAt: Date.now() } }
        );
        return NextResponse.json({ success: true });
      }
      case "read": {
        // Must ensure we target the root document, not adjacency items/folders
        const row = await collection.findOne({
          ...buildOwnerIdQuery(ownerId),
          root: { $exists: true },
        });
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

        const existing = await collection.findOne({
          ...buildOwnerIdQuery(ownerId),
          root: { $exists: true },
        });
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

        const existing = await collection.findOne({
          ...buildOwnerIdQuery(ownerId),
          root: { $exists: true },
        });
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

        const existing = await collection.findOne({
          ...buildOwnerIdQuery(ownerId),
          root: { $exists: true },
        });
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

        const existing = await collection.findOne({
          ...buildOwnerIdQuery(ownerId),
          root: { $exists: true },
        });
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
            authorId: it.authorId,
            authorName: it.authorName,
            authorAvatar: it.authorAvatar,
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

        const existing = await collection.findOne({
          ...buildOwnerIdQuery(ownerId),
          root: { $exists: true },
        });
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
          authorId: String(body.authorId || ownerId),
          authorName:
            typeof body.authorName === "string" ? body.authorName : undefined,
          authorAvatar:
            typeof body.authorAvatar === "string"
              ? body.authorAvatar
              : undefined,
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
            authorId: it.authorId,
            authorName: it.authorName,
            authorAvatar: it.authorAvatar,
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

        const existing = await collection.findOne({
          ...buildOwnerIdQuery(ownerId),
          root: { $exists: true },
        });
        const now = Date.now();
        const baseRoot: FolderNode = existing?.root || {
          id: "root",
          name: "root",
          parentId: undefined,
          children: [],
          items: [],
          createdAt: now,
          updatedAt: now,
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
