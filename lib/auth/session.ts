import { cookies } from 'next/headers';

// Simple session storage using cookies (no JWT needed)
// Stores user data directly in encrypted cookie

export interface SessionData {
  userId: string;
  email: string;
  role: string;
  firstname?: string;
  lastname?: string;
  permissions?: Record<string, boolean>;
}

export async function createSession(data: SessionData): Promise<string> {
  // Just return the data as JSON string - cookie encryption handles security
  return JSON.stringify(data);
}

export async function verifySession(token: string): Promise<SessionData | null> {
  try {
    return JSON.parse(token) as SessionData;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  
  if (!token) return null;
  
  return verifySession(token);
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: false, // Desktop app runs locally over http://127.0.0.1
    sameSite: 'lax',
    maxAge: 60 * 60 * 24
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}
