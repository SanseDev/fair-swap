import { OfferRepository } from '../../repositories/index.js';
export async function offerRoutes(fastify) {
    const offerRepo = new OfferRepository();
    // Get all offers
    fastify.get('/offers', async (request, reply) => {
        const { limit = 100, offset = 0, status, seller, token_mint_a, token_mint_b } = request.query;
        let offers;
        if (status) {
            offers = await offerRepo.findByStatus(status, limit);
        }
        else if (seller) {
            offers = await offerRepo.findBySeller(seller, limit);
        }
        else if (token_mint_a || token_mint_b) {
            offers = await offerRepo.findByTokenMints(token_mint_a, token_mint_b, limit);
        }
        else {
            offers = await offerRepo.findAll(limit, offset);
        }
        return { data: offers };
    });
    // Get active offers
    fastify.get('/offers/active', async (request, reply) => {
        const { limit = 100 } = request.query;
        const offers = await offerRepo.findActiveOffers(limit);
        return { data: offers };
    });
    // Get offer by ID
    fastify.get('/offers/:id', async (request, reply) => {
        const { id } = request.params;
        const offer = await offerRepo.findById(id);
        if (!offer) {
            return reply.status(404).send({ error: 'Offer not found' });
        }
        return { data: offer };
    });
    // Get offers by seller
    fastify.get('/offers/seller/:seller', async (request, reply) => {
        const { seller } = request.params;
        const { limit = 100 } = request.query;
        const offers = await offerRepo.findBySeller(seller, limit);
        return { data: offers };
    });
}
//# sourceMappingURL=offers.routes.js.map