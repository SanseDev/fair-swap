import { OfferRepository } from '../repositories/offer.repository.js';

async function updateOfferPDA() {
  const offerRepo = new OfferRepository();
  
  // Récupérer l'offre
  const offers = await offerRepo.findAll(1000);
  const offer = offers.find(o => o.offer_id === '1765771999039019');
  
  if (!offer) {
    console.error('❌ Offre non trouvée');
    process.exit(1);
  }
  
  console.log('📝 Offre trouvée:', {
    id: offer.id,
    offer_id: offer.offer_id,
    offer_pda: offer.offer_pda || 'null',
    status: offer.status
  });
  
  // Mettre à jour le PDA
  const updated = await offerRepo.update(offer.id, {
    offer_pda: '2WVbUjJyYBoSVdmLZ8Ac7zkzgKYPrjq5M8HzWKhoYt9A'
  });
  
  if (updated) {
    console.log('✅ PDA mis à jour avec succès !');
    console.log('   offer_pda:', updated.offer_pda);
  } else {
    console.error('❌ Échec de la mise à jour');
  }
}

updateOfferPDA().catch(console.error);

