import { NextRequest } from 'next/server';
import { ProposalRepository } from '@/lib/repositories/proposal.repository';
import { jsonResponse, errorResponse } from '@/lib/auth-helpers';

// GET /api/proposals/:id - Get proposal by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const proposalRepo = new ProposalRepository();
    const proposal = await proposalRepo.findById(id);

    if (!proposal) {
      return errorResponse('Proposal not found', 404);
    }

    return jsonResponse({ data: proposal });
  } catch (error) {
    console.error('[Proposals] GET by ID Error:', error);
    return errorResponse('Failed to fetch proposal', 500);
  }
}

