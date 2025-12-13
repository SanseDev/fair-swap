"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
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

interface WalletAuthContextType {
  isConnected: boolean;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  walletAddress: string | null;
  session: UserSession | null;
  error: string | null;
  authenticate: () => Promise<void>;
  logout: () => Promise<void>;
  openWalletModal: () => void;
}

const WalletAuthContext = createContext<WalletAuthContextType | undefined>(undefined);

export function WalletAuthProvider({ children }: { children: ReactNode }) {
  const { publicKey, signMessage, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [session, setSession] = useState<UserSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [authAttempted, setAuthAttempted] = useState(false);

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

    // Prevent multiple authentication attempts
    if (isAuthenticating) return;

    setIsAuthenticating(true);
    setError(null);
    setAuthAttempted(true);

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
      setIsAuthenticating(false);
      setError(null);
    } catch (err: any) {
      console.error("Authentication failed:", err);
      
      setIsAuthenticated(false);
      setIsAuthenticating(false);
      
      // If user rejected the signature, disconnect the wallet immediately
      if (err.message?.includes("User rejected") || 
          err.message?.includes("User cancelled") ||
          err.name === "WalletSignMessageError") {
        await disconnect();
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
        await disconnect();
      } else {
        setError("Authentication failed");
        await disconnect();
      }
    }
  }, [publicKey, signMessage, disconnect, isAuthenticating]);

  // Sync authentication state with wallet connection and auto-authenticate
  useEffect(() => {
    if (!publicKey) {
      setIsAuthenticated(false);
      setSession(null);
      setAuthAttempted(false);
      setError(null);
    } else if (session && session.walletAddress !== publicKey.toBase58()) {
      // Wallet changed, clear old session
      clearAuthToken();
      setIsAuthenticated(false);
      setSession(null);
      setAuthAttempted(false);
      setError(null);
    } else if (publicKey && !isAuthenticated && !isAuthenticating && !authAttempted) {
      // Wallet connected but not authenticated yet, trigger auto-authentication only once
      authenticate();
    }
  }, [publicKey, session, isAuthenticated, isAuthenticating, authAttempted, authenticate]);

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
    setAuthAttempted(false);
    setError(null);
    await disconnect();
  }, [disconnect]);

  const openWalletModal = useCallback(() => {
    setVisible(true);
  }, [setVisible]);

  return (
    <WalletAuthContext.Provider
      value={{
        isConnected: !!publicKey,
        isAuthenticated,
        isAuthenticating,
        walletAddress: publicKey?.toBase58() || null,
        session,
        error,
        authenticate,
        logout,
        openWalletModal,
      }}
    >
      {children}
    </WalletAuthContext.Provider>
  );
}

export function useWalletAuth() {
  const context = useContext(WalletAuthContext);
  if (context === undefined) {
    throw new Error("useWalletAuth must be used within a WalletAuthProvider");
  }
  return context;
}

