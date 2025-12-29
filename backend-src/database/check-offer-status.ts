import { supabase } from '../config/database.js';

const seller = 'T31SBBB9R2XLSTZPT1J74Tp9TgUJA4Ck9WUWKiygvAQ';

async function checkOfferStatus() {
  const { data, error } = await supabase
    .from('offers')
    .select('*')
    .ilike('seller', `%${seller}%`)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  console.log('Offers for seller:', seller);
  console.log(JSON.stringify(data, null, 2));
}

checkOfferStatus().then(() => process.exit(0)).catch(console.error);


