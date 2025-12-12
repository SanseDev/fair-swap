import { BaseRepository } from "./base.repository.js";

export interface AuthNonce {
  wallet_address: string;
  nonce: string;
  expires_at: Date;
  created_at: Date;
}

export interface AuthSession {
  id: number;
  wallet_address: string;
  token: string;
  expires_at: Date;
  created_at: Date;
}

export class AuthRepository extends BaseRepository {
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

  async createSession(
    walletAddress: string,
    token: string,
    expiresAt: Date
  ): Promise<AuthSession> {
    const [session] = await this.db("auth_sessions")
      .insert({
        wallet_address: walletAddress,
        token,
        expires_at: expiresAt,
      })
      .returning("*");
    return session;
  }

  async getSession(token: string): Promise<AuthSession | undefined> {
    return this.db("auth_sessions")
      .where({ token })
      .where("expires_at", ">", new Date())
      .first();
  }

  async deleteSession(token: string): Promise<void> {
    await this.db("auth_sessions").where({ token }).delete();
  }

  async deleteUserSessions(walletAddress: string): Promise<void> {
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

