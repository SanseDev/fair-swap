"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import bs58 from "bs58";
import {
  authApi,
  saveAuthToken,
  getAuthToken,
  clearAuthToken,
  type UserSession,
} from "@/lib/auth";

export function useWalletAuth() {
  const { publicKey, signMessage, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [session, setSession] = useState<UserSession | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check if user has a valid session on mount
  useEffect(() => {
    const checkSession = async () => {
      const token = getAuthToken();
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      try {
        const sessionData = await authApi.getSession(token);
        setSession(sessionData);
        setIsAuthenticated(true);
      } catch (err) {
        clearAuthToken();
        setIsAuthenticated(false);
        setSession(null);
      }
    };

    checkSession();
  }, []);

  const authenticate = useCallback(async () => {
    if (!publicKey || !signMessage) {
      setError("Wallet not connected");
      return;
    }

    setIsAuthenticating(true);
    setError(null);

    try {
      const walletAddress = publicKey.toBase58();

      // Request nonce from backend
      const { nonce, message } = await authApi.requestNonce(walletAddress);

      // Sign the message with wallet
      const messageBytes = new TextEncoder().encode(message);
      const signatureBytes = await signMessage(messageBytes);
      const signature = bs58.encode(signatureBytes);

      // Verify signature and get token
      const authResponse = await authApi.verifySignature(
        walletAddress,
        signature,
        message
      );

      // Save token and session
      saveAuthToken(authResponse.token);
      setSession({
        walletAddress: authResponse.walletAddress,
        expiresAt: authResponse.expiresAt,
      });
      setIsAuthenticated(true);
    } catch (err: any) {
      console.error("Authentication failed:", err);
      setError(err.response?.data?.error || "Authentication failed");
      setIsAuthenticated(false);
    } finally {
      setIsAuthenticating(false);
    }
  }, [publicKey, signMessage]);

  // Sync authentication state with wallet connection and auto-authenticate
  useEffect(() => {
    if (!publicKey) {
      setIsAuthenticated(false);
      setSession(null);
    } else if (session && session.walletAddress !== publicKey.toBase58()) {
      // Wallet changed, clear old session
      clearAuthToken();
      setIsAuthenticated(false);
      setSession(null);
    } else if (publicKey && !isAuthenticated && !isAuthenticating) {
      // Wallet connected but not authenticated, trigger auto-authentication
      authenticate();
    }
  }, [publicKey, session, isAuthenticated, isAuthenticating, authenticate]);

  const logout = useCallback(async () => {
    const token = getAuthToken();
    if (token) {
      try {
        await authApi.logout(token);
      } catch (err) {
        console.error("Logout failed:", err);
      }
    }

    clearAuthToken();
    setIsAuthenticated(false);
    setSession(null);
    await disconnect();
  }, [disconnect]);

  const openWalletModal = useCallback(() => {
    setVisible(true);
  }, [setVisible]);

  return {
    isConnected: !!publicKey,
    isAuthenticated,
    isAuthenticating,
    walletAddress: publicKey?.toBase58() || null,
    session,
    error,
    authenticate,
    logout,
    openWalletModal,
  };
}

