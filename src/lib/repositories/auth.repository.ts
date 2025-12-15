import { Knex } from "knex";
import { getDb } from '../db';

export interface AuthNonce {
  wallet_address: string;
  nonce: string;
  expires_at: Date;
  created_at: Date;
}

export interface AuthSession {
  id: number;
  wallet_address: string;
  session_token: string;
  expires_at: Date;
  created_at: Date;
}

export class AuthRepository {
  private db: Knex;

  constructor(db?: Knex) {
    this.db = db || getDb();
  }

  // Nonce methods
  async createOrUpdateNonce(
    walletAddress: string,
    nonce: string,
    expiresAt: Date
  ): Promise<void> {
    await this.db("auth_nonces")
      .insert({
        wallet_address: walletAddress,
        nonce,
        expires_at: expiresAt,
      })
      .onConflict("wallet_address")
      .merge(["nonce", "expires_at"]);
  }

  async getNonce(walletAddress: string): Promise<AuthNonce | undefined> {
    return this.db("auth_nonces")
      .where({ wallet_address: walletAddress })
      .first();
  }

  async deleteNonce(walletAddress: string): Promise<void> {
    await this.db("auth_nonces")
      .where({ wallet_address: walletAddress })
      .delete();
  }

  async cleanupExpiredNonces(): Promise<void> {
    await this.db("auth_nonces")
      .where("expires_at", "<", new Date())
      .delete();
  }

  // Session methods
  async createSession(
    walletAddress: string,
    sessionToken: string,
    expiresAt: Date
  ): Promise<AuthSession> {
    const [session] = await this.db("auth_sessions")
      .insert({
        wallet_address: walletAddress,
        session_token: sessionToken,
        expires_at: expiresAt,
      })
      .returning("*");
    return session;
  }

  async getSessionByToken(sessionToken: string): Promise<AuthSession | undefined> {
    return this.db("auth_sessions")
      .where({ session_token: sessionToken })
      .where("expires_at", ">", new Date())
      .first();
  }

  async deleteSession(sessionToken: string): Promise<void> {
    await this.db("auth_sessions")
      .where({ session_token: sessionToken })
      .delete();
  }

  async deleteAllUserSessions(walletAddress: string): Promise<void> {
    await this.db("auth_sessions")
      .where({ wallet_address: walletAddress })
      .delete();
  }

  async cleanupExpiredSessions(): Promise<void> {
    await this.db("auth_sessions")
      .where("expires_at", "<", new Date())
      .delete();
  }
}

