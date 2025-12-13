import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, '../../.env') });
export const env = {
    database: {
        url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/fair_swap',
    },
    solana: {
        rpcUrl: process.env.SOLANA_RPC_URL || 'http://127.0.0.1:8899',
        programId: process.env.PROGRAM_ID || 'GUijjz5VNLUkPSw9KKvH5ntUNoJuSDbWQDXZSrQgx9fW',
    },
    api: {
        port: parseInt(process.env.API_PORT || '3001', 10),
    },
};
//# sourceMappingURL=env.js.map