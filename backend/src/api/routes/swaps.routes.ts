import { FastifyInstance } from 'fastify';
import { SwapRepository } from '../../repositories/index.js';

export async function swapRoutes(fastify: FastifyInstance) {
  const swapRepo = new SwapRepository();

  // Get all swaps
  fastify.get('/swaps', async (request, reply) => {
    const { limit = 100, buyer, seller, offer_id } = request.query as any;
    
    let swaps;
    
    if (buyer) {
      swaps = await swapRepo.findByBuyer(buyer, limit);
    } else if (seller) {
      swaps = await swapRepo.findBySeller(seller, limit);
    } else if (offer_id) {
      swaps = await swapRepo.findByOfferId(offer_id);
    } else {
      swaps = await swapRepo.findRecentSwaps(limit);
    }
    
    return { data: swaps };
  });

  // Get recent swaps
  fastify.get('/swaps/recent', async (request, reply) => {
    const { limit = 100 } = request.query as any;
    const swaps = await swapRepo.findRecentSwaps(limit);
    return { data: swaps };
  });

  // Get swap statistics
  fastify.get('/swaps/stats', async (request, reply) => {
    const stats = await swapRepo.getSwapStats();
    return { data: stats };
  });

  // Get swap by ID
  fastify.get('/swaps/:id', async (request, reply) => {
    const { id } = request.params as any;
    const swap = await swapRepo.findById(id);
    
    if (!swap) {
      return reply.status(404).send({ error: 'Swap not found' });
    }
    
    return { data: swap };
  });

  // Get swaps by buyer
  fastify.get('/swaps/buyer/:buyer', async (request, reply) => {
    const { buyer } = request.params as any;
    const { limit = 100 } = request.query as any;
    const swaps = await swapRepo.findByBuyer(buyer, limit);
    return { data: swaps };
  });

  // Get swaps by seller
  fastify.get('/swaps/seller/:seller', async (request, reply) => {
    const { seller } = request.params as any;
    const { limit = 100 } = request.query as any;
    const swaps = await swapRepo.findBySeller(seller, limit);
    return { data: swaps };
  });
}




