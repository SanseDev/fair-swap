import axios from "axios";
import { PublicKey } from "@solana/web3.js";
import bs58 from "bs58";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface NonceResponse {
  nonce: string;
  message: string;
  expiresAt: string;
}

export interface AuthResponse {
  token: string;
  walletAddress: string;
  expiresAt: string;
}

export interface UserSession {
  walletAddress: string;
  expiresAt: string;
}

export const authApi = {
  async requestNonce(walletAddress: string): Promise<NonceResponse> {
    const response = await axios.post(`${API_URL}/api/auth/nonce`, {
      walletAddress,
    });
    return response.data;
  },

  async verifySignature(
    walletAddress: string,
    signature: string,
    message: string
  ): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/api/auth/verify`, {
      walletAddress,
      signature,
      message,
    });
    return response.data;
  },

  async logout(token: string): Promise<void> {
    await axios.post(
      `${API_URL}/api/auth/logout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  async getSession(token: string): Promise<UserSession> {
    const response = await axios.get(`${API_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};

export const AUTH_TOKEN_KEY = "fairswap_auth_token";

export function saveAuthToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }
}

export function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }
  return null;
}

export function clearAuthToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

