import { NextRequest } from 'next/server';
import { SwapRepository } from '@/lib/repositories/swap.repository';
import { jsonResponse, errorResponse } from '@/lib/auth-helpers';

// GET /api/swaps/seller/:seller - Get swaps by seller
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ seller: string }> }
) {
  try {
    const { seller } = await params;
    const searchParams = request.nextUrl.searchParams;
    const limit = Number(searchParams.get('limit') || '100');

    const swapRepo = new SwapRepository();
    const swaps = await swapRepo.findBySeller(seller, limit);

    return jsonResponse({ data: swaps });
  } catch (error) {
    console.error('[Swaps] GET by Seller Error:', error);
    return errorResponse('Failed to fetch swaps', 500);
  }
}

