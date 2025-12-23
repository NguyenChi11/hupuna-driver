import { NextResponse } from "next/server";
import { connectToDatabase } from "@/components/(mongodb)/connectToDatabase";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    await db.command({ ping: 1 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 500 }
    );
  }
}
