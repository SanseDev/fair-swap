import pg from 'pg';

const client = new pg.Client({
  connectionString: 'postgresql://postgres:postgres@localhost:5432/fair_swap',
});

async function verifyTables() {
  try {
    await client.connect();
    const result = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `);
    
    console.log('✓ Database tables:');
    result.rows.forEach(row => console.log(`  - ${row.tablename}`));
    
    await client.end();
  } catch (error) {
    console.error('✗ Error:', error);
    process.exit(1);
  }
}

verifyTables();




