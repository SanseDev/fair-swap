import { db } from '../config/database.js';

async function rollback() {
  try {
    console.log('Rolling back migrations...');
    await db.migrate.rollback();
    console.log('Rollback completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Rollback failed:', error);
    process.exit(1);
  }
}

rollback();




