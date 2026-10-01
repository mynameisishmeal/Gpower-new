import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getSession } from '@/lib/auth/session';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const data = await request.json();

    // If trying to create a Super Admin, verify requester is Super Admin
    if (data.role === 'sadmin') {
      const session = await getSession();
      const emailHeader = request.headers.get('x-user-email');
      const requesterEmail = data.requesterEmail || emailHeader || session?.email;
      let isSuperAdmin = session?.role === 'sadmin';
      if (!isSuperAdmin && requesterEmail) {
        const requester = await User.findOne({ email: requesterEmail });
        if (requester?.role === 'sadmin') {
          isSuperAdmin = true;
        }
      }

      if (!isSuperAdmin) {
        return NextResponse.json(
          { error: 'Access denied: Only Super Admin can create Super Admin accounts' },
          { status: 403 }
        );
      }
    }

    delete data.requesterEmail;
    const user = new User(data);
    await user.save();

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to create user' }, { status: 500 });
  }
}
