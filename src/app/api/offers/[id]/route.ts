import { NextRequest } from 'next/server';
import { OfferRepository } from '@/lib/repositories/offer.repository';
import { jsonResponse, errorResponse } from '@/lib/auth-helpers';

// GET /api/offers/:id - Get offer by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const offerRepo = new OfferRepository();
    const offer = await offerRepo.findById(id);

    if (!offer) {
      return errorResponse('Offer not found', 404);
    }

    return jsonResponse({ data: offer });
  } catch (error) {
    console.error('[Offers] GET by ID Error:', error);
    return errorResponse('Failed to fetch offer', 500);
  }
}

