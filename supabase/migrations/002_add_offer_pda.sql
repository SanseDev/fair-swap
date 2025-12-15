-- Add offer_pda column to offers table to link with on-chain accounts
ALTER TABLE offers ADD COLUMN IF NOT EXISTS offer_pda TEXT;

-- Add index for faster lookups by PDA
CREATE INDEX IF NOT EXISTS idx_offers_offer_pda ON offers(offer_pda);

