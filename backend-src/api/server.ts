import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import { offerRoutes, proposalRoutes, swapRoutes, authRoutes } from './routes/index.js';
import { env } from '../config/env.js';
import { db } from '../config/database.js';

export async function createServer() {
  const fastify = Fastify({
    logger: {
      transport: {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      },
    },
  });

  // Register cookie plugin
  await fastify.register(cookie);

  // Add database instance to fastify
  fastify.decorate('knex', db);

  // CORS with credentials
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.FRONTEND_URL
  ].filter(Boolean);

  fastify.addHook('onRequest', async (request, reply) => {
    const origin = request.headers.origin;
    
    if (origin && allowedOrigins.includes(origin)) {
      reply.header('Access-Control-Allow-Origin', origin);
      reply.header('Access-Control-Allow-Credentials', 'true');
    }
    
    reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (request.method === 'OPTIONS') {
      reply.status(200).send();
    }
  });

  // Health check
  fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // Register routes
  await fastify.register(authRoutes, { prefix: '/api' });
  await fastify.register(offerRoutes, { prefix: '/api' });
  await fastify.register(proposalRoutes, { prefix: '/api' });
  await fastify.register(swapRoutes, { prefix: '/api' });

  return fastify;
}

export async function startServer() {
  const server = await createServer();
  
  try {
    await server.listen({ port: env.api.port, host: '0.0.0.0' });
    console.log(`🚀 API server running on http://localhost:${env.api.port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }

  // Graceful shutdown
  const shutdown = async () => {
    console.log('\nShutting down server...');
    await server.close();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  return server;
}




