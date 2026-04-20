import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { ApiResponse } from '@/types';
import { createSession, setSessionCookie } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Email and password are required'
      }, { status: 400 });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Email does not exist'
      }, { status: 401 });
    }

    // Plain text password comparison (matching old system)
    if (user.password !== password) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Passwords do not match'
      }, { status: 401 });
    }

    const token = await createSession({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      firstname: user.firstname,
      lastname: user.lastname
    });

    await setSessionCookie(token);

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Login successful',
      data: {
        id: user._id,
        email: user.email,
        role: user.role,
        firstname: user.firstname,
        lastname: user.lastname
      }
    });

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error.message
    }, { status: 500 });
  }
}
