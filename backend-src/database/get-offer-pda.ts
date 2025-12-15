import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';

const PROGRAM_ID = new PublicKey('DMpk34ArT3Z8nXtZgQXftWhKNq5MAkMcieEFnUQW7oCU');

// Pour l'offre existante
const seller = new PublicKey('T31SBBB9R2XLSTZPT17J4Tp9TgU3A4Ck9WUWK1ygvAQ');
const offerId = new BN('1765771999039019');

const [offerPda] = PublicKey.findProgramAddressSync(
  [
    Buffer.from('offer'),
    seller.toBuffer(),
    offerId.toArrayLike(Buffer, 'le', 8),
  ],
  PROGRAM_ID
);

console.log('Offer PDA:', offerPda.toBase58());

// Créer la commande SQL
console.log('\nSQL à exécuter dans Supabase:');
console.log(`UPDATE offers SET offer_pda = '${offerPda.toBase58()}' WHERE offer_id = '1765771999039019';`);

