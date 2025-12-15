import { NextRequest } from 'next/server';
import { ProposalRepository } from '@/lib/repositories/proposal.repository';
import { jsonResponse, errorResponse } from '@/lib/auth-helpers';

// GET /api/proposals/pending - Get pending proposals
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const offer_id = searchParams.get('offer_id') || undefined;

    const proposalRepo = new ProposalRepository();
    const proposals = await proposalRepo.findPendingProposals(offer_id);

    return jsonResponse({ data: proposals });
  } catch (error) {
    console.error('[Proposals] GET Pending Error:', error);
    return errorResponse('Failed to fetch pending proposals', 500);
  }
}

