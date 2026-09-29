import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getSession } from '@/lib/auth/session';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { userId, permissions, requesterEmail } = body;

    // Strict Super Admin Verification
    let isSuperAdmin = false;
    const session = await getSession();
    if (session && session.role === 'sadmin') {
      isSuperAdmin = true;
    } else if (requesterEmail) {
      const requester = await User.findOne({ email: requesterEmail });
      if (requester && requester.role === 'sadmin') {
        isSuperAdmin = true;
      }
    }

    if (!isSuperAdmin) {
      return NextResponse.json({
        success: false,
        message: 'Access denied: Only Super Admin is authorized to modify user permissions.'
      }, { status: 403 });
    }

    if (!userId || !permissions) {
      return NextResponse.json({ success: false, message: 'User ID and permissions required' }, { status: 400 });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { permissions },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
