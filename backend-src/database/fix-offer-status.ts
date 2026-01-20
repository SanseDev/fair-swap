import { supabase } from '../config/database.js';

const offerId = '1765770707217754';

async function fixOfferStatus() {
  const { error } = await supabase
    .from('offers')
    .update({ status: 'completed' })
    .eq('offer_id', offerId);
  
  if (error) throw error;
  
  console.log(`✅ Offer ${offerId} marked as completed`);
}

fixOfferStatus().then(() => process.exit(0)).catch(console.error);


