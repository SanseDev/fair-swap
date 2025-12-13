export class AuthRepository {
    db;
    constructor(db) {
        this.db = db;
    }
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
    async createSession(walletAddress, token, expiresAt) {
        const [session] = await this.db("auth_sessions")
            .insert({
            wallet_address: walletAddress,
            token,
            expires_at: expiresAt,
        })
            .returning("*");
        return session;
    }
    async getSession(token) {
        return this.db("auth_sessions")
            .where({ token })
            .where("expires_at", ">", new Date())
            .first();
    }
    async deleteSession(token) {
        await this.db("auth_sessions").where({ token }).delete();
    }
    async deleteUserSessions(walletAddress) {
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