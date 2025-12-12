import type { Knex } from 'knex';
import { env } from './backend-src/config/env.js';

const config: { [key: string]: Knex.Config } = {
  development: {
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
  },
  production: {
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
  },
};

export default config;




