import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: resolve(__dirname, '../../.env') });

export const env = {
  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },
  solana: {
    rpcUrl: process.env.SOLANA_RPC_URL || 'http://127.0.0.1:8899',
    programId: process.env.PROGRAM_ID || 'GUijjz5VNLUkPSw9KKvH5ntUNoJuSDbWQDXZSrQgx9fW',
  },
  api: {
    port: parseInt(process.env.API_PORT || '3001', 10),
  },
} as const;

