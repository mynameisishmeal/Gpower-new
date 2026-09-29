import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { ApiResponse } from '@/types';
import { createSession, setSessionCookie } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { email, password } = await request.json();
    console.log(`[Auth API] Login request received for: ${email}`);

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
      lastname: user.lastname,
      permissions: user.permissions
    });

    const response = NextResponse.json<ApiResponse>({
      success: true,
      message: 'Login successful',
      data: {
        id: user._id,
        email: user.email,
        role: user.role,
        firstname: user.firstname,
        lastname: user.lastname,
        permissions: user.permissions
      }
    });

    response.cookies.set('session', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/'
    });

    return response;

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error.message
    }, { status: 500 });
  }
}
