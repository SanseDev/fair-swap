"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import bs58 from "bs58";
import {
  authApi,
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
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  
  // Track if wallet was previously connected to distinguish disconnect from "not connected yet"
  const wasConnectedRef = useRef(false);
  // Track if we're in the process of logging out to prevent authentication during disconnect
  const isLoggingOutRef = useRef(false);

  // Check for existing session on mount (cookie-based)
  useEffect(() => {
    const checkSession = async () => {
      console.log('[WalletAuth] 🔍 Checking for existing session...');
      try {
        const sessionData = await authApi.getSession();
        console.log('[WalletAuth] ✅ Session found:', {
          wallet: sessionData.walletAddress.slice(0, 8) + '...',
          expires: sessionData.expiresAt
        });
        setSession(sessionData);
        setIsAuthenticated(true);
        // Mark that this wallet was connected to prevent clearing on auto-reconnect
        wasConnectedRef.current = true;
      } catch (err) {
        console.log('[WalletAuth] ℹ️  No active session found (will authenticate on wallet connection)');
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkSession();
  }, []);

  const authenticate = useCallback(async () => {
    // Don't authenticate if we're logging out
    if (isLoggingOutRef.current) {
      console.log("[WalletAuth] Skipping authentication - logout in progress");
      return;
    }

    if (!publicKey || !signMessage) {
      setError("Wallet not connected");
      return;
    }

    // Prevent multiple authentication attempts
    if (isAuthenticating) return;

    setIsAuthenticating(true);
    setError(null);

    try {
      const walletAddress = publicKey.toBase58();

      // Request nonce from backend
      const { nonce, message } = await authApi.requestNonce(walletAddress);

      // Check again if signMessage is still available (wallet might have disconnected)
      if (!signMessage) {
        console.log("[WalletAuth] Wallet disconnected during authentication");
        setIsAuthenticating(false);
        return;
      }

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

      // Session is stored in HTTP-only cookie by the server
      setSession({
        walletAddress: authResponse.walletAddress,
        expiresAt: authResponse.expiresAt,
      });
      setIsAuthenticated(true);
      setIsAuthenticating(false);
      setError(null);
    } catch (err: any) {
      console.error("[WalletAuth] Authentication failed:", err);
      
      setIsAuthenticated(false);
      setIsAuthenticating(false);
      
      // Only disconnect if user explicitly rejected - don't disconnect on network errors
      if (err.message?.includes("User rejected") || 
          err.message?.includes("User cancelled") ||
          err.name === "WalletSignMessageError") {
        console.log("[WalletAuth] User rejected signature, disconnecting");
        try {
          isLoggingOutRef.current = true;
          await disconnect();
        } catch (disconnectErr) {
          console.error("[WalletAuth] Error during disconnect after rejection:", disconnectErr);
        } finally {
          setTimeout(() => {
            isLoggingOutRef.current = false;
          }, 100);
        }
      } else {
        // For other errors, just show the error but keep wallet connected
        const errorMsg = err.response?.data?.error || err.message || "Authentication failed";
        setError(errorMsg);
        console.log("[WalletAuth] Auth error (keeping wallet connected):", errorMsg);
      }
    }
  }, [publicKey, signMessage, disconnect, isAuthenticating]);

  // Sync authentication state with wallet connection
  useEffect(() => {
    // Don't do anything until session check completes
    if (isCheckingSession) {
      console.log('[WalletAuth] ⏳ Still checking for existing session...');
      return;
    }

    console.log('[WalletAuth] 🔄 Sync effect:', {
      hasPublicKey: !!publicKey,
      hasSignMessage: !!signMessage,
      isAuthenticated,
      hasSession: !!session,
      sessionWallet: session?.walletAddress?.slice(0, 8) + '...',
      currentWallet: publicKey?.toBase58().slice(0, 8) + '...',
      isAuthenticating,
    });

    if (!publicKey || !signMessage) {
      // Wallet not ready yet or disconnected
      if (!publicKey && wasConnectedRef.current && (isAuthenticated || session)) {
        // Wallet was connected before and now it's gone - user disconnected
        console.log('[WalletAuth] 🔌 Wallet disconnected by user, clearing state');
        setIsAuthenticated(false);
        setSession(null);
        setError(null);
        wasConnectedRef.current = false;
      }
      // If wallet was never connected (wasConnectedRef.current === false), 
      // don't clear session - wallet might still be connecting
      return;
    }

    // Mark that wallet is now connected
    wasConnectedRef.current = true;
    const walletAddress = publicKey.toBase58();

    // If session exists but for different wallet, clear and re-auth
    if (session && session.walletAddress !== walletAddress) {
      console.log('[WalletAuth] 🔄 Wallet changed, clearing old session');
      setIsAuthenticated(false);
      setSession(null);
      setError(null);
      // Will re-auth on next effect run
      return;
    }

    // If session exists and matches wallet, we're authenticated - DON'T re-authenticate
    if (session && session.walletAddress === walletAddress) {
      if (!isAuthenticated) {
        console.log('[WalletAuth] ✅ Session exists for wallet, marking as authenticated');
        setIsAuthenticated(true);
      } else {
        console.log('[WalletAuth] ✅ Already authenticated with valid session');
      }
      return;
    }

    // Only trigger authentication if: wallet ready, no session, not already authenticating, and not logging out
    if (!session && !isAuthenticated && !isAuthenticating && publicKey && signMessage && !isLoggingOutRef.current) {
      console.log('[WalletAuth] 🔐 No session found, triggering authentication (signature required)');
      authenticate();
    }
  }, [publicKey, signMessage, session, isAuthenticated, isAuthenticating, isCheckingSession, authenticate]);

  const logout = useCallback(async () => {
    console.log('[WalletAuth] 🚪 Logging out...');
    isLoggingOutRef.current = true;
    
    try {
      await authApi.logout();
    } catch (err) {
      console.error('[WalletAuth] Logout error:', err);
    }
    
    setIsAuthenticated(false);
    setSession(null);
    setError(null);
    
    try {
      await disconnect();
    } catch (err) {
      console.error('[WalletAuth] Disconnect error:', err);
    } finally {
      // Reset the flag after a short delay to ensure all effects have processed
      setTimeout(() => {
        isLoggingOutRef.current = false;
        console.log('[WalletAuth] ✅ Logout complete');
      }, 100);
    }
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

