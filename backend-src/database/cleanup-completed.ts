import { supabase } from '../config/database.js';

async function cleanupCompletedTransactions() {
  console.log('🧹 Starting cleanup of completed transactions...\n');

  try {
    // 1. Delete all swaps (completed transactions)
    console.log('📦 Deleting all swaps...');
    const { data: swaps, error: swapsError } = await supabase
      .from('swaps')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Match all records
      .select('id');
    
    if (swapsError) throw swapsError;
    console.log(`✅ Deleted ${swaps?.length || 0} swaps\n`);

    // 2. Delete completed and cancelled offers
    console.log('📋 Deleting completed and cancelled offers...');
    const { data: offers, error: offersError } = await supabase
      .from('offers')
      .delete()
      .in('status', ['completed', 'cancelled'])
      .select('id');
    
    if (offersError) throw offersError;
    console.log(`✅ Deleted ${offers?.length || 0} completed/cancelled offers\n`);

    // 3. Delete accepted and withdrawn proposals
    console.log('💼 Deleting accepted and withdrawn proposals...');
    const { data: proposals, error: proposalsError } = await supabase
      .from('proposals')
      .delete()
      .in('status', ['accepted', 'withdrawn'])
      .select('id');
    
    if (proposalsError) throw proposalsError;
    console.log(`✅ Deleted ${proposals?.length || 0} accepted/withdrawn proposals\n`);

    // 4. Get remaining counts
    const { count: remainingOffers } = await supabase
      .from('offers')
      .select('*', { count: 'exact', head: true });

    const { count: remainingProposals } = await supabase
      .from('proposals')
      .select('*', { count: 'exact', head: true });

    console.log('📊 Database Summary:');
    console.log(`   Active offers: ${remainingOffers || 0}`);
    console.log(`   Pending proposals: ${remainingProposals || 0}`);
    console.log(`   Swaps: 0 (all deleted)\n`);

    console.log('✨ Cleanup completed successfully!');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  }
}

// Run the cleanup
cleanupCompletedTransactions()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

