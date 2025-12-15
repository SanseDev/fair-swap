import { NextRequest } from 'next/server';
import { SwapRepository } from '@/lib/repositories/swap.repository';
import { jsonResponse, errorResponse } from '@/lib/auth-helpers';

// GET /api/swaps/buyer/:buyer - Get swaps by buyer
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ buyer: string }> }
) {
  try {
    const { buyer } = await params;
    const searchParams = request.nextUrl.searchParams;
    const limit = Number(searchParams.get('limit') || '100');

    const swapRepo = new SwapRepository();
    const swaps = await swapRepo.findByBuyer(buyer, limit);

    return jsonResponse({ data: swaps });
  } catch (error) {
    console.error('[Swaps] GET by Buyer Error:', error);
    return errorResponse('Failed to fetch swaps', 500);
  }
}

