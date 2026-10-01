import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getSession } from '@/lib/auth/session';

export async function PUT(request: Request) {
  try {
    await dbConnect();
    const { id, ...data } = await request.json();

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Determine requester role
    const session = await getSession();
    const emailHeader = request.headers.get('x-user-email');
    const requesterEmail = data.requesterEmail || emailHeader || session?.email;
    let requesterRole = session?.role;
    if (!requesterRole && requesterEmail) {
      const requester = await User.findOne({ email: requesterEmail });
      requesterRole = requester?.role;
    }

    // Security check: Regular admin cannot modify Super Admin accounts
    if (targetUser.role === 'sadmin' && requesterRole !== 'sadmin') {
      return NextResponse.json(
        { error: 'Access denied: Regular admin cannot modify Super Admin accounts' },
        { status: 403 }
      );
    }

    // If password was sent as empty or masked '••••••••', do not overwrite existing password
    if (!data.password || data.password === '••••••••') {
      delete data.password;
    }
    delete data.passwordconfirmation;
    delete data.requesterEmail;

    // Regular admin cannot promote anyone to sadmin
    if (requesterRole !== 'sadmin' && data.role === 'sadmin') {
      delete data.role;
    }

    await User.findByIdAndUpdate(id, data);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to update user' }, { status: 500 });
  }
}
