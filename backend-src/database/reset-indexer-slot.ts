import { supabase } from '../config/database.js';

// Reset to 1 hour ago (approximately 150000 slots back)
const slotsToGoBack = 150000;

async function resetIndexerSlot() {
  const { data: current } = await supabase
    .from('indexer_state')
    .select('*')
    .eq('key', 'fair_swap')
    .single();
  
  console.log('Current slot:', current?.last_processed_slot);
  
  const newSlot = Number(current?.last_processed_slot) - slotsToGoBack;
  
  const { error } = await supabase
    .from('indexer_state')
    .update({ last_processed_slot: newSlot })
    .eq('key', 'fair_swap');
  
  if (error) throw error;
  
  console.log('Reset to slot:', newSlot);
  console.log('Indexer will rescan the last hour on next poll');
}

resetIndexerSlot().then(() => process.exit(0)).catch(console.error);


