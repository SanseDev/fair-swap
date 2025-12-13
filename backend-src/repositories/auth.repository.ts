import { Knex } from "knex";

export interface AuthNonce {
  wallet_address: string;
  nonce: string;
  expires_at: Date;
  created_at: Date;
}

export class AuthRepository {
  private db: Knex;

  constructor(db: Knex) {
    this.db = db;
  }

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
}

