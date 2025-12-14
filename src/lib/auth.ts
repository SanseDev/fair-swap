import axios from "axios";
import { PublicKey } from "@solana/web3.js";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Configure axios to send cookies
axios.defaults.withCredentials = true;

export interface NonceResponse {
  nonce: string;
  message: string;
  expiresAt: string;
}

export interface AuthResponse {
  success: boolean;
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
    const response = await axios.post(
      `${API_URL}/api/auth/verify`,
      {
        walletAddress,
        signature,
        message,
      },
      { withCredentials: true }
    );
    return response.data;
  },

  async logout(): Promise<void> {
    await axios.post(
      `${API_URL}/api/auth/logout`,
      {},
      { withCredentials: true }
    );
  },

  async getSession(): Promise<UserSession> {
    const response = await axios.get(`${API_URL}/api/auth/me`, {
      withCredentials: true,
    });
    return response.data;
  },
};

export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

