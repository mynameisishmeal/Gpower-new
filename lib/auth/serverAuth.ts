import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function checkServerPermission(
  req: Request,
  requiredPermission: string
): Promise<{ authorized: boolean; response?: NextResponse; user?: any }> {
  try {
    await dbConnect();
    const session = await getSession();

    let user = null;

    // 1. Session cookie lookup
    if (session?.userId) {
      user = await User.findById(session.userId);
    } else if (session?.email) {
      user = await User.findOne({ email: session.email });
    }

    // 2. Fallback header lookup (e.g. x-user-email)
    if (!user) {
      const emailHeader = req.headers.get('x-user-email');
      if (emailHeader) {
        user = await User.findOne({ email: emailHeader });
      }
    }

    if (!user) {
      return {
        authorized: false,
        response: NextResponse.json(
          { error: 'Unauthorized: Session not found. Please log in.' },
          { status: 401 }
        )
      };
    }

    // Super Admin bypasses all checks
    if (user.role === 'sadmin') {
      return { authorized: true, user };
    }

    // Granular permission check
    const userPerms = user.permissions as Record<string, boolean> | undefined;
    if (userPerms && userPerms[requiredPermission] === true) {
      return { authorized: true, user };
    }

    return {
      authorized: false,
      response: NextResponse.json(
        { error: `Forbidden: You do not have permission (${requiredPermission}) to perform this action.` },
        { status: 403 }
      )
    };
  } catch (error: any) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: error?.message || 'Server authorization error' },
        { status: 500 }
      )
    };
  }
}
