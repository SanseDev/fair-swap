import { NextRequest } from 'next/server';
import { ProposalRepository } from '@/lib/repositories/proposal.repository';
import { jsonResponse, errorResponse } from '@/lib/auth-helpers';

// GET /api/proposals - Get all proposals with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Number(searchParams.get('limit') || '100');
    const offset = Number(searchParams.get('offset') || '0');
    const status = searchParams.get('status') || undefined;
    const buyer = searchParams.get('buyer') || undefined;
    const offer_id = searchParams.get('offer_id') || undefined;

    const proposalRepo = new ProposalRepository();
    let proposals;

    if (status) {
      proposals = await proposalRepo.findByStatus(status as 'pending' | 'accepted' | 'withdrawn', limit);
    } else if (buyer) {
      proposals = await proposalRepo.findByBuyer(buyer, limit);
    } else if (offer_id) {
      proposals = await proposalRepo.findByOfferId(offer_id, limit);
    } else {
      proposals = await proposalRepo.findAll(limit, offset);
    }

    return jsonResponse({ data: proposals });
  } catch (error) {
    console.error('[Proposals] GET Error:', error);
    return errorResponse('Failed to fetch proposals', 500);
  }
}

