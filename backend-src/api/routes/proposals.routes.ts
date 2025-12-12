import { FastifyInstance } from 'fastify';
import { ProposalRepository } from '../../repositories/index.js';

export async function proposalRoutes(fastify: FastifyInstance) {
  const proposalRepo = new ProposalRepository();

  // Get all proposals
  fastify.get('/proposals', async (request, reply) => {
    const { limit = 100, offset = 0, status, buyer, offer_id } = request.query as any;
    
    let proposals;
    
    if (status) {
      proposals = await proposalRepo.findByStatus(status, limit);
    } else if (buyer) {
      proposals = await proposalRepo.findByBuyer(buyer, limit);
    } else if (offer_id) {
      proposals = await proposalRepo.findByOfferId(offer_id, limit);
    } else {
      proposals = await proposalRepo.findAll(limit, offset);
    }
    
    return { data: proposals };
  });

  // Get pending proposals
  fastify.get('/proposals/pending', async (request, reply) => {
    const { offer_id } = request.query as any;
    const proposals = await proposalRepo.findPendingProposals(offer_id);
    return { data: proposals };
  });

  // Get proposal by ID
  fastify.get('/proposals/:id', async (request, reply) => {
    const { id } = request.params as any;
    const proposal = await proposalRepo.findById(id);
    
    if (!proposal) {
      return reply.status(404).send({ error: 'Proposal not found' });
    }
    
    return { data: proposal };
  });

  // Get proposals by buyer
  fastify.get('/proposals/buyer/:buyer', async (request, reply) => {
    const { buyer } = request.params as any;
    const { limit = 100 } = request.query as any;
    const proposals = await proposalRepo.findByBuyer(buyer, limit);
    return { data: proposals };
  });

  // Get proposals by offer
  fastify.get('/proposals/offer/:offer_id', async (request, reply) => {
    const { offer_id } = request.params as any;
    const { limit = 100 } = request.query as any;
    const proposals = await proposalRepo.findByOfferId(offer_id, limit);
    return { data: proposals };
  });
}




