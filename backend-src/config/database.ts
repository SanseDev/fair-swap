import knex from 'knex';
import { env } from './env.js';

export const db = knex({
  client: 'pg',
  connection: env.database.url,
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    directory: './backend-src/database/migrations',
    extension: 'ts',
  },
});




