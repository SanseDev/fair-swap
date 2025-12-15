import { NextRequest } from 'next/server';
import { ProposalRepository } from '@/lib/repositories/proposal.repository';
import { jsonResponse, errorResponse } from '@/lib/auth-helpers';

// GET /api/proposals/offer/:offer_id - Get proposals by offer ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ offer_id: string }> }
) {
  try {
    const { offer_id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const limit = Number(searchParams.get('limit') || '100');

    const proposalRepo = new ProposalRepository();
    const proposals = await proposalRepo.findByOfferId(offer_id, limit);

    return jsonResponse({ data: proposals });
  } catch (error) {
    console.error('[Proposals] GET by Offer Error:', error);
    return errorResponse('Failed to fetch proposals', 500);
  }
}

