import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const emailHeader = request.headers.get('x-user-email');
    const requesterEmail = searchParams.get('requesterEmail') || emailHeader;

    // Determine requester role: prioritize explicit requester email, then session cookie
    let requesterRole = '';
    if (requesterEmail) {
      const requester = await User.findOne({
        email: { $regex: new RegExp(`^${requesterEmail.trim()}$`, 'i') }
      });
      if (requester) {
        requesterRole = (requester.role || '').trim().toLowerCase();
      }
    }

    if (!requesterRole) {
      const session = await getSession();
      requesterRole = (session?.role || '').trim().toLowerCase();
    }

    const isSuperAdmin = requesterRole === 'sadmin' || requesterRole === 'super admin';
    const isRegularAdmin = requesterRole === 'admin';

    const users = await User.find({}).lean();

    const sanitizedUsers = users.map((u: any) => {
      const targetRole = (u.role || '').trim().toLowerCase();
      const isWorker = targetRole === 'worker';

      // Super admin can see all passwords
      // Regular admin can only view worker password
      // Regular admin cannot see super admin password (or other admin password)
      const canSeePassword = isSuperAdmin || (isRegularAdmin && isWorker);

      return {
        ...u,
        password: canSeePassword ? u.password : '••••••••',
        canViewPassword: canSeePassword
      };
    });

    return NextResponse.json(
      { users: sanitizedUsers },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
        }
      }
    );
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
