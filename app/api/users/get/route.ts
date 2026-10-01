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
    const id = searchParams.get('id');
    const emailHeader = request.headers.get('x-user-email');
    const requesterEmail = searchParams.get('requesterEmail') || emailHeader;

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Determine requester role
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

    const targetRole = (targetUser.role || '').trim().toLowerCase();
    const isSuperAdmin = requesterRole === 'sadmin' || requesterRole === 'super admin';
    const isRegularAdmin = requesterRole === 'admin';
    const isWorker = targetRole === 'worker';

    // Super admin can see all passwords
    // Regular admin can only view worker password
    // Regular admin cannot see super admin password
    const canSeePassword = isSuperAdmin || (isRegularAdmin && isWorker);

    const userObj: any = targetUser.toObject();
    if (!canSeePassword) {
      delete userObj.password;
    }

    return NextResponse.json({ user: userObj, canSeePassword });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}
