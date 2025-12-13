import { AuthRepository } from "../../repositories/index.js";
import { nanoid } from "nanoid";
import nacl from "tweetnacl";
import bs58 from "bs58";
import jwt from "jsonwebtoken";
import { PublicKey } from "@solana/web3.js";
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const NONCE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const SESSION_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
export async function authRoutes(fastify) {
    const authRepo = new AuthRepository(fastify.knex);
    // Request a nonce for wallet signing
    fastify.post("/auth/nonce", async (request, reply) => {
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
    fastify.post("/auth/verify", async (request, reply) => {
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
            let publicKey;
            try {
                publicKey = new PublicKey(walletAddress);
            }
            catch (err) {
                return reply.status(400).send({ error: "Invalid wallet address" });
            }
            const publicKeyBytes = publicKey.toBytes();
            const isValid = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
            if (!isValid) {
                return reply.status(401).send({ error: "Invalid signature" });
            }
            // Delete the used nonce
            await authRepo.deleteNonce(walletAddress);
            // Create JWT token (stateless, no DB storage needed)
            const token = jwt.sign({ walletAddress }, JWT_SECRET, { expiresIn: "7d" });
            const sessionExpiresAt = new Date(Date.now() + SESSION_EXPIRY_MS);
            return {
                token,
                walletAddress,
                expiresAt: sessionExpiresAt.toISOString(),
            };
        }
        catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: "Authentication failed" });
        }
    });
    // Logout (client-side only - JWT is stateless)
    fastify.post("/auth/logout", async (request, reply) => {
        return { success: true };
    });
    // Verify token and get wallet info
    fastify.get("/auth/me", async (request, reply) => {
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return reply.status(401).send({ error: "No token provided" });
        }
        const token = authHeader.substring(7);
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            return {
                walletAddress: decoded.walletAddress,
                expiresAt: new Date(decoded.exp * 1000).toISOString(),
            };
        }
        catch (error) {
            fastify.log.error(error);
            return reply.status(401).send({ error: "Invalid token" });
        }
    });
    // Cleanup expired nonces (called periodically)
    fastify.post("/auth/cleanup", async (request, reply) => {
        try {
            await authRepo.cleanupExpiredNonces();
            return { success: true };
        }
        catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: "Cleanup failed" });
        }
    });
}
//# sourceMappingURL=auth.routes.js.map