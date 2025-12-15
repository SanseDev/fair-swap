import { NextRequest } from 'next/server';
import { OfferRepository } from '@/lib/repositories/offer.repository';
import { jsonResponse, errorResponse } from '@/lib/auth-helpers';

// GET /api/offers - Get all offers with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Number(searchParams.get('limit') || '100');
    const offset = Number(searchParams.get('offset') || '0');
    const status = searchParams.get('status') || undefined;
    const seller = searchParams.get('seller') || undefined;
    const token_mint_a = searchParams.get('token_mint_a') || undefined;
    const token_mint_b = searchParams.get('token_mint_b') || undefined;
    const asset_type = searchParams.get('asset_type') || 'all';

    const offerRepo = new OfferRepository();
    const offers = await offerRepo.findWithFilters({
      status: status as 'active' | 'cancelled' | 'completed' | undefined,
      seller,
      token_mint_a,
      token_mint_b,
      asset_type: asset_type as 'sol' | 'spl' | 'nft' | 'all',
      limit,
      offset,
    });

    return jsonResponse({ data: offers });
  } catch (error) {
    console.error('[Offers] GET Error:', error);
    return errorResponse('Failed to fetch offers', 500);
  }
}

// POST /api/offers - Create new offer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      offer_id,
      seller,
      token_mint_a,
      token_amount_a,
      token_mint_b,
      token_amount_b,
      allow_alternatives,
      signature,
      slot = 0,
    } = body;

    // Validate required fields
    if (!offer_id || !seller || !token_mint_a || !token_amount_a || !token_mint_b || !token_amount_b || !signature) {
      return errorResponse('Missing required fields', 400);
    }

    const offerRepo = new OfferRepository();
    const offer = await offerRepo.create({
      offer_id,
      seller,
      token_mint_a,
      token_amount_a: token_amount_a.toString(),
      token_mint_b,
      token_amount_b: token_amount_b.toString(),
      allow_alternatives: allow_alternatives || false,
      status: 'active',
      signature,
      slot,
    } as any);

    return jsonResponse({ data: offer }, 201);
  } catch (error: any) {
    console.error('[Offers] POST Error:', error);
    return errorResponse('Failed to create offer', 500);
  }
}

