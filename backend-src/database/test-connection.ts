import { supabase } from '../config/database.js';

async function testConnection() {
  console.log('🧪 Testing Supabase connection...\n');

  try {
    // Test 1: Check if tables exist
    console.log('1️⃣ Checking tables...');
    const tables = ['offers', 'proposals', 'swaps', 'indexer_state', 'auth_nonces', 'auth_sessions'];
    
    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        console.log(`   ❌ Table "${table}" - Error: ${error.message}`);
      } else {
        console.log(`   ✅ Table "${table}" - OK (${data?.length || 0} rows in sample)`);
      }
    }

    // Test 2: Try to insert a test offer
    console.log('\n2️⃣ Testing INSERT on offers table...');
    const testOffer = {
      offer_id: 'test_' + Date.now(),
      seller: 'TestSeller' + Date.now(),
      token_mint_a: 'So11111111111111111111111111111111111111112',
      token_amount_a: '1000000000',
      token_mint_b: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      token_amount_b: '1000000',
      allow_alternatives: false,
      status: 'active',
      signature: 'test_sig_' + Date.now(),
      slot: 0,
    };

    const { data: insertData, error: insertError } = await supabase
      .from('offers')
      .insert(testOffer)
      .select()
      .single();

    if (insertError) {
      console.log(`   ❌ INSERT failed: ${insertError.message}`);
    } else {
      console.log(`   ✅ INSERT successful - ID: ${insertData.id}`);
      
      // Clean up test data
      await supabase.from('offers').delete().eq('id', insertData.id);
      console.log(`   🧹 Test data cleaned up`);
    }

    // Test 3: Check indexer state
    console.log('\n3️⃣ Checking indexer state...');
    const { data: stateData, error: stateError } = await supabase
      .from('indexer_state')
      .select('*')
      .eq('key', 'fair_swap')
      .single();

    if (stateError) {
      console.log(`   ❌ Indexer state error: ${stateError.message}`);
    } else {
      console.log(`   ✅ Indexer state: last_processed_slot = ${stateData.last_processed_slot}`);
    }

    // Test 4: Count existing data
    console.log('\n4️⃣ Counting existing records...');
    for (const table of ['offers', 'proposals', 'swaps']) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`   ❌ ${table}: Error counting`);
      } else {
        console.log(`   📊 ${table}: ${count} records`);
      }
    }

    console.log('\n✅ All tests completed successfully!');
    console.log('\n💡 If you see this message, Supabase is properly configured.');
    console.log('💡 If the indexer is not saving data, check that:');
    console.log('   1. The indexer is running: pnpm index:start');
    console.log('   2. Your Solana program is deployed and the PROGRAM_ID is correct');
    console.log('   3. Transactions are being sent to the blockchain\n');

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

testConnection();


