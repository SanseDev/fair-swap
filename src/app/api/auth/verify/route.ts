import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import { PublicKey } from '@solana/web3.js';
import { AuthRepository } from '@/lib/repositories/auth.repository';
import { SESSION_EXPIRY_MS, setSessionCookie, jsonResponse, errorResponse } from '@/lib/auth-helpers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, signature, message } = body;

    if (!walletAddress || !signature || !message) {
      return errorResponse('Wallet address, signature, and message are required', 400);
    }

    const authRepo = new AuthRepository();

    // Get nonce from database
    const nonceRecord = await authRepo.getNonce(walletAddress);
    
    if (!nonceRecord) {
      return errorResponse('Nonce not found or expired', 401);
    }

    // Check if nonce expired
    if (new Date(nonceRecord.expires_at) < new Date()) {
      await authRepo.deleteNonce(walletAddress);
      return errorResponse('Nonce expired', 401);
    }

    // Verify message contains nonce
    if (!message.includes(nonceRecord.nonce)) {
      return errorResponse('Invalid message format', 401);
    }

    // Verify signature using Solana's method
    const signatureBytes = bs58.decode(signature);
    const messageBytes = new TextEncoder().encode(message);
    
    let publicKey: PublicKey;
    try {
      publicKey = new PublicKey(walletAddress);
    } catch (err) {
      return errorResponse('Invalid wallet address', 400);
    }

    const publicKeyBytes = publicKey.toBytes();

    const isValid = nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      publicKeyBytes
    );

    if (!isValid) {
      return errorResponse('Invalid signature', 401);
    }

    // Delete used nonce
    await authRepo.deleteNonce(walletAddress);

    // Generate session token
    const sessionToken = nanoid(64);
    const sessionExpiresAt = new Date(Date.now() + SESSION_EXPIRY_MS);

    // Store session in database
    await authRepo.createSession(walletAddress, sessionToken, sessionExpiresAt);

    // Create response and set cookie
    const response = NextResponse.json({
      success: true,
      walletAddress,
      expiresAt: sessionExpiresAt.toISOString(),
    });

    setSessionCookie(response, sessionToken, sessionExpiresAt);

    return response;
  } catch (error) {
    console.error('[Auth Verify] Error:', error);
    return errorResponse('Authentication failed', 500);
  }
}

