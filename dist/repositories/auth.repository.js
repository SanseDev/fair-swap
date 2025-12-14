export class AuthRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    // Nonce methods
    async createOrUpdateNonce(walletAddress, nonce, expiresAt) {
        await this.db("auth_nonces")
            .insert({
            wallet_address: walletAddress,
            nonce,
            expires_at: expiresAt,
        })
            .onConflict("wallet_address")
            .merge(["nonce", "expires_at"]);
    }
    async getNonce(walletAddress) {
        return this.db("auth_nonces")
            .where({ wallet_address: walletAddress })
            .first();
    }
    async deleteNonce(walletAddress) {
        await this.db("auth_nonces")
            .where({ wallet_address: walletAddress })
            .delete();
    }
    async cleanupExpiredNonces() {
        await this.db("auth_nonces")
            .where("expires_at", "<", new Date())
            .delete();
    }
    // Session methods
    async createSession(walletAddress, sessionToken, expiresAt) {
        const [session] = await this.db("auth_sessions")
            .insert({
            wallet_address: walletAddress,
            session_token: sessionToken,
            expires_at: expiresAt,
        })
            .returning("*");
        return session;
    }
    async getSessionByToken(sessionToken) {
        return this.db("auth_sessions")
            .where({ session_token: sessionToken })
            .where("expires_at", ">", new Date())
            .first();
    }
    async deleteSession(sessionToken) {
        await this.db("auth_sessions")
            .where({ session_token: sessionToken })
            .delete();
    }
    async deleteAllUserSessions(walletAddress) {
        await this.db("auth_sessions")
            .where({ wallet_address: walletAddress })
            .delete();
    }
    async cleanupExpiredSessions() {
        await this.db("auth_sessions")
            .where("expires_at", "<", new Date())
            .delete();
    }
}
//# sourceMappingURL=auth.repository.js.map