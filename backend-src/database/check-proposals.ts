import { supabase } from '../config/database.js';

async function checkProposals() {
  const { data: proposals, error } = await supabase
    .from('proposals')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  console.log('\n💼 PROPOSALS:', proposals?.length || 0);
  proposals?.forEach(p => {
    console.log(`  - ID: ${p.proposal_id} | Buyer: ${p.buyer.slice(0,8)} | Offer: ${p.offer_id} | Status: ${p.status}`);
  });
}

checkProposals().then(() => process.exit(0)).catch(console.error);

