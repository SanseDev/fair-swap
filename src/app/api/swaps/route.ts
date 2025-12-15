import { NextRequest } from 'next/server';
import { SwapRepository } from '@/lib/repositories/swap.repository';
import { jsonResponse, errorResponse } from '@/lib/auth-helpers';

// GET /api/swaps - Get all swaps with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Number(searchParams.get('limit') || '100');
    const buyer = searchParams.get('buyer') || undefined;
    const seller = searchParams.get('seller') || undefined;
    const offer_id = searchParams.get('offer_id') || undefined;

    const swapRepo = new SwapRepository();
    let swaps;

    if (buyer) {
      swaps = await swapRepo.findByBuyer(buyer, limit);
    } else if (seller) {
      swaps = await swapRepo.findBySeller(seller, limit);
    } else if (offer_id) {
      swaps = await swapRepo.findByOfferId(offer_id);
    } else {
      swaps = await swapRepo.findRecentSwaps(limit);
    }

    return jsonResponse({ data: swaps });
  } catch (error) {
    console.error('[Swaps] GET Error:', error);
    return errorResponse('Failed to fetch swaps', 500);
  }
}

