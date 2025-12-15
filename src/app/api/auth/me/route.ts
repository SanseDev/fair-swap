import { NextRequest } from 'next/server';
import { AuthRepository } from '@/lib/repositories/auth.repository';
import { jsonResponse, errorResponse } from '@/lib/auth-helpers';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('fairswap_session')?.value;
    
    if (!sessionToken) {
      return errorResponse('No session found', 401);
    }

    const authRepo = new AuthRepository();
    const session = await authRepo.getSessionByToken(sessionToken);
    
    if (!session) {
      return errorResponse('Session invalid or expired', 401);
    }

    return jsonResponse({
      walletAddress: session.wallet_address,
      expiresAt: typeof session.expires_at === 'string' 
        ? session.expires_at 
        : session.expires_at.toISOString(),
    });
  } catch (error) {
    console.error('[Auth Me] Error:', error);
    return errorResponse('Failed to validate session', 500);
  }
}

