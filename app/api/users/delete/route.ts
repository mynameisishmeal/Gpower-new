import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getSession } from '@/lib/auth/session';

export async function DELETE(request: Request) {
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
    const session = await getSession();
    let requesterRole = session?.role;
    if (!requesterRole && requesterEmail) {
      const requester = await User.findOne({ email: requesterEmail });
      requesterRole = requester?.role;
    }

    // Security check: Regular admin cannot delete Super Admin
    if (targetUser.role === 'sadmin' && requesterRole !== 'sadmin') {
      return NextResponse.json(
        { error: 'Access denied: Regular admin cannot delete Super Admin accounts' },
        { status: 403 }
      );
    }

    await User.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to delete user' }, { status: 500 });
  }
}
