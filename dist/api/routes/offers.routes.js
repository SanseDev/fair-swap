import { OfferRepository } from '../../repositories/index.js';
export async function offerRoutes(fastify) {
    const offerRepo = new OfferRepository();
    // Get all offers with combined filters
    fastify.get('/offers', async (request, reply) => {
        const { limit = 100, offset = 0, status, seller, token_mint_a, token_mint_b, asset_type = 'all' } = request.query;
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
    // Create new offer (manual entry, mainly used for testing or backup)
    fastify.post('/offers', async (request, reply) => {
        const { offer_id, seller, token_mint_a, token_amount_a, token_mint_b, token_amount_b, allow_alternatives, signature, slot = 0, } = request.body;
        // Validate required fields
        if (!offer_id || !seller || !token_mint_a || !token_amount_a || !token_mint_b || !token_amount_b || !signature) {
            return reply.status(400).send({ error: 'Missing required fields' });
        }
        try {
            const offer = await offerRepo.create({
                offer_id,
                seller,
                token_mint_a,
                token_amount_a: token_amount_a.toString(),
                token_mint_b,
                token_amount_b: token_amount_b.toString(),
                allow_alternatives: allow_alternatives || false,
                status: 'active',
                signature,
                slot,
            });
            return reply.status(201).send({ data: offer });
        }
        catch (err) {
            console.error('Create offer error:', err);
            return reply.status(500).send({ error: 'Failed to create offer' });
        }
    });
}
//# sourceMappingURL=offers.routes.js.map