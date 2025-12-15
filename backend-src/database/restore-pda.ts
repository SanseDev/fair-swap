import { OfferRepository } from '../repositories/offer.repository.js';

async function restorePDA() {
  const offerRepo = new OfferRepository();
  const offers = await offerRepo.findAll(1000);
  const offer = offers.find(o => o.offer_id === '1765771999039019');
  
  if (offer) {
    // Remettre l'ancien PDA qui était dans la DB
    const updated = await offerRepo.update(offer.id, {
      offer_pda: '2WVbUjJykzS6A4FyG2T1XGg7xJh2rUqLqBvRGg9m8Zyn'
    });
    console.log('✅ PDA restauré à:', updated?.offer_pda);
  } else {
    console.log('❌ Offre non trouvée');
  }
}

restorePDA().catch(console.error);

