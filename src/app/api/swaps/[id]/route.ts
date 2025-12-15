import { NextRequest } from 'next/server';
import { SwapRepository } from '@/lib/repositories/swap.repository';
import { jsonResponse, errorResponse } from '@/lib/auth-helpers';

// GET /api/swaps/:id - Get swap by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const swapRepo = new SwapRepository();
    const swap = await swapRepo.findById(id);

    if (!swap) {
      return errorResponse('Swap not found', 404);
    }

    return jsonResponse({ data: swap });
  } catch (error) {
    console.error('[Swaps] GET by ID Error:', error);
    return errorResponse('Failed to fetch swap', 500);
  }
}

