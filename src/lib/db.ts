import knex from 'knex';

// Singleton DB connection for Next.js API routes
let db: ReturnType<typeof knex> | null = null;

export function getDb() {
  if (!db) {
    db = knex({
      client: 'pg',
      connection: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/fairswap',
      pool: {
        min: 2,
        max: 10,
      },
    });
  }
  return db;
}

