import { supabase } from '../config/database.js';

async function checkAllOffers() {
  const { data: offers, error: offersError } = await supabase
    .from('offers')
    .select('*')
    .order('created_at', { ascending: false });
  
  const { data: swaps, error: swapsError } = await supabase
    .from('swaps')
    .select('*')
    .order('executed_at', { ascending: false });
  
  if (offersError) throw offersError;
  if (swapsError) throw swapsError;
  
  console.log('\n📋 OFFERS:', offers?.length || 0);
  offers?.forEach(o => {
    console.log(`  - ${o.offer_id} | ${o.seller.slice(0,8)} | ${o.status} | ${o.created_at}`);
  });
  
  console.log('\n💱 SWAPS:', swaps?.length || 0);
  swaps?.forEach(s => {
    console.log(`  - ${s.offer_id} | ${s.executed_at}`);
  });
}

checkAllOffers().then(() => process.exit(0)).catch(console.error);

