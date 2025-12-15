import { NextRequest } from 'next/server';
import { OfferRepository } from '@/lib/repositories/offer.repository';
import { jsonResponse, errorResponse } from '@/lib/auth-helpers';

// GET /api/offers/active - Get active offers
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Number(searchParams.get('limit') || '100');

    const offerRepo = new OfferRepository();
    const offers = await offerRepo.findActiveOffers(limit);

    return jsonResponse({ data: offers });
  } catch (error) {
    console.error('[Offers] GET Active Error:', error);
    return errorResponse('Failed to fetch active offers', 500);
  }
}

