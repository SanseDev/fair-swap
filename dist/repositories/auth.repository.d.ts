import { Knex } from "knex";
export interface AuthNonce {
    wallet_address: string;
    nonce: string;
    expires_at: Date;
    created_at: Date;
}
export declare class AuthRepository {
    private db;
    constructor(db: Knex);
    createOrUpdateNonce(walletAddress: string, nonce: string, expiresAt: Date): Promise<void>;
    getNonce(walletAddress: string): Promise<AuthNonce | undefined>;
    deleteNonce(walletAddress: string): Promise<void>;
    cleanupExpiredNonces(): Promise<void>;
}
//# sourceMappingURL=auth.repository.d.ts.map