import { FastifyInstance } from "fastify";
import { AuthRepository } from "../../repositories/index.js";
import { nanoid } from "nanoid";
import nacl from "tweetnacl";
import bs58 from "bs58";
import jwt from "jsonwebtoken";
import { PublicKey } from "@solana/web3.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const NONCE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
const COOKIE_NAME = "fairswap_session";

export async function authRoutes(fastify: FastifyInstance) {
  const authRepo = new AuthRepository(fastify.knex);

  // Request a nonce for wallet signing
  fastify.post<{
    Body: { walletAddress: string };
  }>("/auth/nonce", async (request, reply) => {
    const { walletAddress } = request.body;

    if (!walletAddress) {
      return reply.status(400).send({ error: "Wallet address is required" });
    }

    // Generate a unique nonce
    const nonce = nanoid(32);
    const expiresAt = new Date(Date.now() + NONCE_EXPIRY_MS);

    await authRepo.createOrUpdateNonce(walletAddress, nonce, expiresAt);

    return {
      nonce,
      message: `Sign this message to authenticate with FairSwap:\n\nNonce: ${nonce}\nWallet: ${walletAddress}\n\nThis signature will not cost you any gas.`,
      expiresAt: expiresAt.toISOString(),
    };
  });

  // Verify signature and create session
  fastify.post<{
    Body: {
      walletAddress: string;
      signature: string;
      message: string;
    };
  }>("/auth/verify", async (request, reply) => {
    const { walletAddress, signature, message } = request.body;

    if (!walletAddress || !signature || !message) {
      return reply.status(400).send({
        error: "Wallet address, signature, and message are required",
      });
    }

    try {
      // Get the nonce from database
      const nonceRecord = await authRepo.getNonce(walletAddress);
      
      if (!nonceRecord) {
        return reply.status(401).send({ error: "Nonce not found or expired" });
      }

      // Check if nonce is expired
      if (new Date(nonceRecord.expires_at) < new Date()) {
        await authRepo.deleteNonce(walletAddress);
        return reply.status(401).send({ error: "Nonce expired" });
      }

      // Verify the message contains the nonce
      if (!message.includes(nonceRecord.nonce)) {
        return reply.status(401).send({ error: "Invalid message format" });
      }

      // Verify the signature using Solana's method
      const signatureBytes = bs58.decode(signature);
      const messageBytes = new TextEncoder().encode(message);
      
      // Validate and get public key
      let publicKey: PublicKey;
      try {
        publicKey = new PublicKey(walletAddress);
      } catch (err) {
        return reply.status(400).send({ error: "Invalid wallet address" });
      }

      const publicKeyBytes = publicKey.toBytes();

      const isValid = nacl.sign.detached.verify(
        messageBytes,
        signatureBytes,
        publicKeyBytes
      );

      if (!isValid) {
        return reply.status(401).send({ error: "Invalid signature" });
      }

      // Delete the used nonce
      await authRepo.deleteNonce(walletAddress);

      // Generate session token
      const sessionToken = nanoid(64);
      const sessionExpiresAt = new Date(Date.now() + SESSION_EXPIRY_MS);

      // Store session in database
      await authRepo.createSession(walletAddress, sessionToken, sessionExpiresAt);

      // Set HTTP-only cookie
      reply.setCookie(COOKIE_NAME, sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        expires: sessionExpiresAt,
      });

      return {
        success: true,
        walletAddress,
        expiresAt: sessionExpiresAt.toISOString(),
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: "Authentication failed" });
    }
  });

  // Logout - delete session from DB and clear cookie
  fastify.post("/auth/logout", async (request, reply) => {
    const sessionToken = request.cookies[COOKIE_NAME];
    
    if (sessionToken) {
      try {
        await authRepo.deleteSession(sessionToken);
      } catch (err) {
        fastify.log.error(err);
      }
    }

    reply.clearCookie(COOKIE_NAME, { path: "/" });
    return { success: true };
  });

  // Check session - validates cookie and returns user info
  fastify.get("/auth/me", async (request, reply) => {
    const sessionToken = request.cookies[COOKIE_NAME];
    
    if (!sessionToken) {
      return reply.status(401).send({ error: "No session found" });
    }

    try {
      const session = await authRepo.getSessionByToken(sessionToken);
      
      if (!session) {
        reply.clearCookie(COOKIE_NAME, { path: "/" });
        return reply.status(401).send({ error: "Session invalid or expired" });
      }

      return {
        walletAddress: session.wallet_address,
        expiresAt: session.expires_at.toISOString(),
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: "Failed to validate session" });
    }
  });

  // Cleanup expired nonces and sessions (called periodically)
  fastify.post("/auth/cleanup", async (request, reply) => {
    try {
      await authRepo.cleanupExpiredNonces();
      await authRepo.cleanupExpiredSessions();
      return { success: true };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: "Cleanup failed" });
    }
  });
}

