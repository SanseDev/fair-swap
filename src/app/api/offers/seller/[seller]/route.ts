import { NextRequest } from 'next/server';
import { OfferRepository } from '@/lib/repositories/offer.repository';
import { jsonResponse, errorResponse } from '@/lib/auth-helpers';

// GET /api/offers/seller/:seller - Get offers by seller
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ seller: string }> }
) {
  try {
    const { seller } = await params;
    const searchParams = request.nextUrl.searchParams;
    const limit = Number(searchParams.get('limit') || '100');

    const offerRepo = new OfferRepository();
    const offers = await offerRepo.findBySeller(seller, limit);

    return jsonResponse({ data: offers });
  } catch (error) {
    console.error('[Offers] GET by Seller Error:', error);
    return errorResponse('Failed to fetch offers', 500);
  }
}

