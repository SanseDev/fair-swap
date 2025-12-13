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
}
//# sourceMappingURL=auth.repository.js.map