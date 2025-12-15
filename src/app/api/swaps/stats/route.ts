import { NextRequest } from 'next/server';
import { SwapRepository } from '@/lib/repositories/swap.repository';
import { jsonResponse, errorResponse } from '@/lib/auth-helpers';

// GET /api/swaps/stats - Get swap statistics
export async function GET(request: NextRequest) {
  try {
    const swapRepo = new SwapRepository();
    const stats = await swapRepo.getSwapStats();

    return jsonResponse({ data: stats });
  } catch (error) {
    console.error('[Swaps] GET Stats Error:', error);
    return errorResponse('Failed to fetch swap statistics', 500);
  }
}

