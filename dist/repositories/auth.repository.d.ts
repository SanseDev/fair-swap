import { Knex } from "knex";
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
export declare class AuthRepository {
    private db;
    constructor(db: Knex);
    createOrUpdateNonce(walletAddress: string, nonce: string, expiresAt: Date): Promise<void>;
    getNonce(walletAddress: string): Promise<AuthNonce | undefined>;
    deleteNonce(walletAddress: string): Promise<void>;
    cleanupExpiredNonces(): Promise<void>;
    createSession(walletAddress: string, sessionToken: string, expiresAt: Date): Promise<AuthSession>;
    getSessionByToken(sessionToken: string): Promise<AuthSession | undefined>;
    deleteSession(sessionToken: string): Promise<void>;
    deleteAllUserSessions(walletAddress: string): Promise<void>;
    cleanupExpiredSessions(): Promise<void>;
}
//# sourceMappingURL=auth.repository.d.ts.map