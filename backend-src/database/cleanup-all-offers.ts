import { supabase } from '../config/database.js';

async function cleanupAllOffers() {
  console.log('🧹 Starting cleanup of ALL offers...\n');

  try {
    // 1. Delete all proposals first (they reference offers)
    console.log('💼 Deleting all proposals...');
    const { data: proposals, error: proposalsError } = await supabase
      .from('proposals')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Match all records
      .select('id');
    
    if (proposalsError) throw proposalsError;
    console.log(`✅ Deleted ${proposals?.length || 0} proposals\n`);

    // 2. Delete all offers (including active ones)
    console.log('📋 Deleting all offers...');
    const { data: offers, error: offersError } = await supabase
      .from('offers')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Match all records
      .select('id');
    
    if (offersError) throw offersError;
    console.log(`✅ Deleted ${offers?.length || 0} offers\n`);

    // 3. Get remaining counts
    const { count: remainingOffers } = await supabase
      .from('offers')
      .select('*', { count: 'exact', head: true });

    const { count: remainingProposals } = await supabase
      .from('proposals')
      .select('*', { count: 'exact', head: true });

    const { count: remainingSwaps } = await supabase
      .from('swaps')
      .select('*', { count: 'exact', head: true });

    console.log('📊 Database Summary:');
    console.log(`   Offers: ${remainingOffers || 0}`);
    console.log(`   Proposals: ${remainingProposals || 0}`);
    console.log(`   Swaps: ${remainingSwaps || 0}\n`);

    console.log('✨ Cleanup completed successfully!');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  }
}

// Run the cleanup
cleanupAllOffers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

