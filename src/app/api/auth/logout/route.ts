import { NextRequest, NextResponse } from 'next/server';
import { AuthRepository } from '@/lib/repositories/auth.repository';
import { clearSessionCookie, jsonResponse } from '@/lib/auth-helpers';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('fairswap_session')?.value;
    
    if (sessionToken) {
      const authRepo = new AuthRepository();
      await authRepo.deleteSession(sessionToken);
    }

    const response = NextResponse.json({ success: true });
    clearSessionCookie(response);
    
    return response;
  } catch (error) {
    console.error('[Auth Logout] Error:', error);
    const response = NextResponse.json({ success: true });
    clearSessionCookie(response);
    return response;
  }
}

