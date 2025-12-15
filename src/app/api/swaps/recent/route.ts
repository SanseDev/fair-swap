import { NextRequest } from 'next/server';
import { SwapRepository } from '@/lib/repositories/swap.repository';
import { jsonResponse, errorResponse } from '@/lib/auth-helpers';

// GET /api/swaps/recent - Get recent swaps
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Number(searchParams.get('limit') || '100');

    const swapRepo = new SwapRepository();
    const swaps = await swapRepo.findRecentSwaps(limit);

    return jsonResponse({ data: swaps });
  } catch (error) {
    console.error('[Swaps] GET Recent Error:', error);
    return errorResponse('Failed to fetch recent swaps', 500);
  }
}

