-- Fix: Add PDA to existing offer
-- Le PDA de l'offre est "2WVbUjJy..." (visible dans les logs)
UPDATE offers 
SET offer_pda = '2WVbUjJykzS6A4FyG2T1XGg7xJh2rUqLqBvRGg9m8Zyn'
WHERE offer_id = '1765771999039019';

-- Vérifier
SELECT id, offer_id, offer_pda, status FROM offers WHERE offer_id = '1765771999039019';

