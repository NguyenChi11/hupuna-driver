import { getUserFromCookie } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { getRowByIdOrCode } from '@/lib/mongoDBCRUD';
import { USERS_COLLECTION_NAME, User } from '@/types/User';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const userFromCookie = await getUserFromCookie();

  if (!userFromCookie) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  // Fetch full user data from database using the ID from the cookie
  try {
    const result = await getRowByIdOrCode<User>(USERS_COLLECTION_NAME, {
      _id: userFromCookie._id as string
    });

    if (result && result.row) {
      const fullUser = result.row;
      // Remove sensitive data
      const { password, ...safeUser } = fullUser;
      
      return NextResponse.json({ success: true, user: safeUser });
    } else {
       // Fallback to cookie data if db lookup fails (shouldn't happen usually)
       return NextResponse.json({ success: true, user: userFromCookie });
    }
  } catch (error) {
    console.error("Error fetching user details:", error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
