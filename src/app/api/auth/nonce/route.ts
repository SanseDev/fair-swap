import { NextRequest } from 'next/server';
import { nanoid } from 'nanoid';
import { AuthRepository } from '@/lib/repositories/auth.repository';
import { NONCE_EXPIRY_MS, jsonResponse, errorResponse } from '@/lib/auth-helpers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress } = body;

    if (!walletAddress) {
      return errorResponse('Wallet address is required', 400);
    }

    const authRepo = new AuthRepository();

    // Generate unique nonce
    const nonce = nanoid(32);
    const expiresAt = new Date(Date.now() + NONCE_EXPIRY_MS);

    await authRepo.createOrUpdateNonce(walletAddress, nonce, expiresAt);

    return jsonResponse({
      nonce,
      message: `Sign this message to authenticate with FairSwap:\n\nNonce: ${nonce}\nWallet: ${walletAddress}\n\nThis signature will not cost you any gas.`,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('[Auth Nonce] Error:', error);
    return errorResponse('Failed to generate nonce', 500);
  }
}

