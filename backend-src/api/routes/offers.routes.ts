import { FastifyInstance } from 'fastify';
import { OfferRepository } from '../../repositories/index.js';

export async function offerRoutes(fastify: FastifyInstance) {
  const offerRepo = new OfferRepository();

  // Get all offers with combined filters
  fastify.get('/offers', async (request, reply) => {
    const { limit = 100, offset = 0, status, seller, token_mint_a, token_mint_b, asset_type = 'all' } = request.query as any;
    
    const offers = await offerRepo.findWithFilters({
      status,
      seller,
      token_mint_a,
      token_mint_b,
      asset_type,
      limit: Number(limit),
      offset: Number(offset),
    });
    
    return { data: offers };
  });

  // Get active offers
  fastify.get('/offers/active', async (request, reply) => {
    const { limit = 100 } = request.query as any;
    const offers = await offerRepo.findActiveOffers(limit);
    return { data: offers };
  });

  // Get offer by ID
  fastify.get('/offers/:id', async (request, reply) => {
    const { id } = request.params as any;
    const offer = await offerRepo.findById(id);
    
    if (!offer) {
      return reply.status(404).send({ error: 'Offer not found' });
    }
    
    return { data: offer };
  });

  // Get offers by seller
  fastify.get('/offers/seller/:seller', async (request, reply) => {
    const { seller } = request.params as any;
    const { limit = 100 } = request.query as any;
    const offers = await offerRepo.findBySeller(seller, limit);
    return { data: offers };
  });
}




