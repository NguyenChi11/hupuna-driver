import { NextRequest, NextResponse } from "next/server";
import { getAllRows } from "@/lib/mongoDBCRUD";
import { User, USERS_COLLECTION_NAME } from "@/types/User";
import { signJWT } from "@/lib/auth";
import { createSession, fingerprintFromHeaders } from "@/lib/session";

export const runtime = "nodejs";

interface LoginPayload {
  username?: string;
  password?: string;
}

interface UsersRequestBody {
  action?: "login";
  data?: LoginPayload;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as UsersRequestBody;
    const { action, data } = body;
    const collectionName = USERS_COLLECTION_NAME;

    switch (action) {
      case "login": {
        const loginData = (data || {}) as LoginPayload;
        const { username, password } = loginData;

        if (!username || !password) {
          return NextResponse.json(
            { success: false, message: "Thiếu tên người dùng hoặc mật khẩu!" },
            { status: 400 }
          );
        }

        const queryResult = await getAllRows<User>(collectionName, {
          filters: {
            username,
            password,
          },
          limit: 1,
        });

        const found = queryResult.data?.[0];

        if (!found) {
          return NextResponse.json(
            { success: false, message: "Username hoặc Password không đúng!" },
            { status: 401 }
          );
        }

        const fp = fingerprintFromHeaders({
          "user-agent": req.headers.get("user-agent") || "",
          "accept-language": req.headers.get("accept-language") || "",
        });
        const sid = await createSession({
          userId: String(found._id),
          deviceName: "web",
          headers: {
            "user-agent": req.headers.get("user-agent") || "",
            "accept-language": req.headers.get("accept-language") || "",
          },
          ttlDays: 3650,
        });
        const token = await signJWT({
          _id: String(found._id),
          username: String(found.username || ""),
          name: String(found.name || ""),
          sid,
          fp,
        });

        const res = NextResponse.json({
          success: true,
          token,
          user: {
            _id: String(found._id),
            name: String(found.name || ""),
            username: String(found.username || ""),
            avatar: found.avatar,
            role: found.role,
            department: found.department,
            status: found.status,
            phone: found["phone"],
            gender: found["gender"],
            birthday: found["birthday"],
            email: found["email"],
            address: found["address"],
            title: found["title"],
            background: found["background"],
            bio: found["bio"],
            nicknames: found.nicknames,
          },
        });

        res.cookies.set("session_token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          path: "/",
          sameSite: "lax",
          maxAge: 30 * 24 * 3600,
        });
        res.cookies.set("sid", sid, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          path: "/",
          sameSite: "lax",
          maxAge: 3650 * 24 * 3600,
        });

        return res;
      }

      default:
        return NextResponse.json(
          { success: false, message: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}