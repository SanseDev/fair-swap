import { NextRequest } from 'next/server';
import { ProposalRepository } from '@/lib/repositories/proposal.repository';
import { jsonResponse, errorResponse } from '@/lib/auth-helpers';

// GET /api/proposals/buyer/:buyer - Get proposals by buyer
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ buyer: string }> }
) {
  try {
    const { buyer } = await params;
    const searchParams = request.nextUrl.searchParams;
    const limit = Number(searchParams.get('limit') || '100');

    const proposalRepo = new ProposalRepository();
    const proposals = await proposalRepo.findByBuyer(buyer, limit);

    return jsonResponse({ data: proposals });
  } catch (error) {
    console.error('[Proposals] GET by Buyer Error:', error);
    return errorResponse('Failed to fetch proposals', 500);
  }
}

