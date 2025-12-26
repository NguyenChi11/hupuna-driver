import { Collection, Filter, ObjectId, OptionalUnlessRequiredId, UpdateFilter } from 'mongodb';
import { connectToDatabase } from '../components/(mongodb)/connectToDatabase';

// ========== Helper ====================
export function safeParse(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  const firstChar = value.trim().charAt(0);
  if (firstChar !== '[' && firstChar !== '{') return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

// ========== READ HEADERS (Mongo ko có headers nên trả key từ document) ==========
export const getHeaders = async (collectionName: string): Promise<string[]> => {
  const { db } = await connectToDatabase();
  const doc = await db.collection(collectionName).findOne({});
  return doc ? Object.keys(doc) : [];
};

// ========== FIND BY FIELD ==========
export const findByField = async <T extends Record<string, unknown>>(
  collectionName: string,
  field: keyof T,
  value: string | number,
): Promise<{ data: T } | null> => {
  const { db } = await connectToDatabase();
  const item = await db
    .collection(collectionName)
    .find({ [field]: value })
    .toArray();
  if (!item) return null;

  return { data: item as unknown as T };
};

// ========== GET BY ID OR CODE ==========
export const getRowByIdOrCode = async <T extends Record<string, unknown>>(
  collectionName: string,
  { id, code, _id }: { id?: string | number; code?: string; _id?: string },
): Promise<{ rowIndex: number; row: T } | null> => {
  const { db } = await connectToDatabase();
  const filter: Record<string, unknown> = {};

  if (_id) {
    if (ObjectId.isValid(_id)) {
      filter['_id'] = new ObjectId(_id);
    } else if (!isNaN(Number(_id))) {
      filter['_id'] = Number(_id);
    }

  }

  if (id) filter['id'] = id;
  if (code) filter['code'] = code;

  const row = await db.collection(collectionName).findOne(filter);
  return row ? { rowIndex: 0, row: row as unknown as T } : null;
};

// ========== GET ALL (search, filter, sort, pagination) ==========
export const getAllRows = async <T extends Record<string, unknown>>(
  collectionName: string,
  {
    search,
    skip = 0,
    limit,
    field,
    value,
    filters,
    sort,
  }: {
    search?: string;
    skip?: number;
    limit?: number;
    field?: keyof T;
    value?: unknown;
    filters?: Record<string, unknown>;
    sort?: { field: keyof T; order?: 'asc' | 'desc' } | Array<{ field: keyof T; order?: 'asc' | 'desc' }>;
  } = {},
): Promise<{ total: number; data: T[] }> => {
  const { db } = await connectToDatabase();
  const collection = db.collection(collectionName);

  const query: Record<string, unknown> = {};

  // Filter field=value
  if (field && value !== undefined) {
    query[field as string] = value;
  }

  // ====== 2. Filter nâng cao ======
  if (filters && Object.keys(filters).length > 0) {
    for (const [key, rawVal] of Object.entries(filters)) {
      if (rawVal === undefined || rawVal === null) continue;

      // --- Nếu là mệnh đề $or hoặc $and ---
      // Trường hợp tìm kiếm có điều kiện kết hợp
      if (key === '$or' || key === '$and') {
        query[key] = rawVal;
        continue;
      }

      // --- Nếu là object có $gte / $lte (lọc khoảng thời gian hoặc khoảng số) ---
      if (
        typeof rawVal === 'object' &&
        rawVal !== null &&
        ('$gte' in (rawVal as Record<string, unknown>) || '$lte' in (rawVal as Record<string, unknown>))
      ) {
        (query as Record<string, unknown>)[key] = rawVal;
        continue;
      }
      // --- Nếu là object có toán tử MongoDB ---
      // Trường hợp tìm kiếm có điều kiện
      // $in – chứa trong danh sách giá trị (giống WHERE field IN (...))
      // $nin – không chứa trong danh sách giá trị
      // $gte – lớn hơn hoặc bằng (>=)
      // $lte – nhỏ hơn hoặc bằng (<=)
      // $gt – lớn hơn (>)
      // $lt – nhỏ hơn (<)
      // $ne – khác (!=)
      if (
        typeof rawVal === 'object' &&
        rawVal !== null &&
        Object.keys(rawVal as Record<string, unknown>).some((k) =>
          ['$in', '$nin', '$gte', '$lte', '$gt', '$lt', '$ne'].includes(k),
        )
      ) {
        query[key] = rawVal;
        continue;
      }

      // --- Nếu là chuỗi bắt đầu bằng "#" => regex ---
      if (typeof rawVal === 'string' && rawVal.trim().startsWith('#')) {
        // Trường hợp tìm kiếm gần đúng (regex)
        query[key] = {
          $regex: rawVal.trim().slice(1),
          $options: 'i',
        };
        continue;
      }

      // Trường hợp so sánh chính xác (exact match)
      query[key] = rawVal;
    }
  }

  // Search toàn bộ text - cách cũ - chỉ lấy key 1 cấp
  // if (search) {
  //     const sampleDoc = await collection.findOne();
  //     if (sampleDoc) {
  //         const textFields = Object.keys(sampleDoc).filter(
  //             (k) => typeof sampleDoc[k] === "string"
  //         );
  //
  //         if (textFields.length > 0) {
  //             query["$or"] = textFields.map((key) => ({
  //                 [key]: { $regex: search, $options: "i" },
  //             }));
  //         }
  //     }
  // }

  // Search toàn bộ text - cải tiến để lấy cả các key trong object con - nhiều cấp
  if (search) {
    const sampleDoc = await collection.findOne();
    if (sampleDoc) {
      // 👉 Hàm đệ quy lấy tất cả key string (kể cả nested)
      const getStringPaths = (obj: unknown, prefix = ''): string[] => {
        let keys: string[] = [];
        for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
          const path = prefix ? `${prefix}.${k}` : k;
          if (typeof v === 'string') keys.push(path);
          else if (v && typeof v === 'object' && !Array.isArray(v)) keys = keys.concat(getStringPaths(v, path));
        }
        return keys;
      };

      const textFields = getStringPaths(sampleDoc);

      if (textFields.length > 0) {
        query['$or'] = textFields.map((path) => ({
          [path]: { $regex: search, $options: 'i' },
        }));
      }
    }
  }

  // Sort
  let sortOption: Record<string, 1 | -1> = {};
  if (sort) {
    const sortArr = Array.isArray(sort) ? sort : [sort];
    sortOption = sortArr.reduce(
      (acc, s) => {
        acc[s.field as string] = s.order === 'desc' ? -1 : 1;
        return acc;
      },
      {} as Record<string, 1 | -1>,
    );
  }

  const cursor = collection.find(query).sort(sortOption).skip(skip);

  if (limit) {
    cursor.limit(limit);
  }

  const data = await cursor.toArray();
  const total = await collection.countDocuments(query);

  return { total, data: data as unknown as T[] };
};

// ========== ADD ROW ==========
export const addRow = async <T extends Record<string, unknown>>(
  collectionName: string,
  data: T,
): Promise<T> => {
  const { db } = await connectToDatabase();
  const result = await db.collection(collectionName).insertOne(data);
  return { ...data, _id: result.insertedId } as unknown as T;
};

// ========== UPDATE BY FIELD ==========
export const updateByField = async <T extends Record<string, unknown>>(
  collectionName: string,
  field: keyof T,
  value: string | number,
  data: Partial<T>,
): Promise<T | null> => {
  const { db } = await connectToDatabase();
  const filter: Record<string, unknown> = { [field]: value };
  if (field === '_id' && typeof value === 'string' && ObjectId.isValid(value)) {
     filter['_id'] = new ObjectId(value);
  }

  const result = await db.collection(collectionName).findOneAndUpdate(
    filter,
    { $set: data },
    { returnDocument: 'after' }
  );

  return result ? (result as unknown as T) : null;
};

// ========== DELETE BY FIELD ==========
export const deleteByField = async <T extends Record<string, unknown>>(
  collectionName: string,
  field: keyof T,
  value: string | number,
): Promise<boolean> => {
  const { db } = await connectToDatabase();
   const filter: Record<string, unknown> = { [field]: value };
  if (field === '_id' && typeof value === 'string' && ObjectId.isValid(value)) {
     filter['_id'] = new ObjectId(value);
  }
  const result = await db.collection(collectionName).deleteOne(filter);
  return result.deletedCount === 1;
};

// ========== GET COLLECTION ==========
export const getCollection = async (collectionName: string): Promise<Collection> => {
    const { db } = await connectToDatabase();
    return db.collection(collectionName);
}
