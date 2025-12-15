import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export const COOKIE_NAME = 'fairswap_session';
export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
export const NONCE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
export const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

export function setSessionCookie(response: NextResponse, token: string, expiresAt: Date) {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', // Changed from 'strict' to 'lax' to allow cookies on page refresh
    path: '/',
    expires: expiresAt,
  });
  return response;
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.delete(COOKIE_NAME);
  return response;
}

export function jsonResponse(data: any, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

export function errorResponse(error: string, status = 400): NextResponse {
  return NextResponse.json({ error }, { status });
}

