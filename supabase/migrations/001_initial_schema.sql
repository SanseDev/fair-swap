-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create offers table
CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  offer_id TEXT NOT NULL,
  seller TEXT NOT NULL,
  token_mint_a TEXT NOT NULL,
  token_amount_a TEXT NOT NULL,
  token_mint_b TEXT NOT NULL,
  token_amount_b TEXT NOT NULL,
  allow_alternatives BOOLEAN DEFAULT FALSE,
  status TEXT CHECK (status IN ('active', 'cancelled', 'completed')) DEFAULT 'active',
  signature TEXT NOT NULL UNIQUE,
  slot BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for offers
CREATE INDEX IF NOT EXISTS idx_offers_seller ON offers(seller);
CREATE INDEX IF NOT EXISTS idx_offers_status ON offers(status);
CREATE INDEX IF NOT EXISTS idx_offers_token_mint_a ON offers(token_mint_a);
CREATE INDEX IF NOT EXISTS idx_offers_token_mint_b ON offers(token_mint_b);
CREATE UNIQUE INDEX IF NOT EXISTS idx_offers_seller_offer_id ON offers(seller, offer_id);

-- Create proposals table
CREATE TABLE IF NOT EXISTS proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id TEXT NOT NULL,
  buyer TEXT NOT NULL,
  offer_id TEXT NOT NULL,
  proposed_mint TEXT NOT NULL,
  proposed_amount TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'withdrawn')) DEFAULT 'pending',
  signature TEXT NOT NULL UNIQUE,
  slot BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for proposals
CREATE INDEX IF NOT EXISTS idx_proposals_buyer ON proposals(buyer);
CREATE INDEX IF NOT EXISTS idx_proposals_offer_id ON proposals(offer_id);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status);
CREATE INDEX IF NOT EXISTS idx_proposals_proposed_mint ON proposals(proposed_mint);

-- Create swaps table
CREATE TABLE IF NOT EXISTS swaps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  offer_id TEXT NOT NULL,
  proposal_id TEXT,
  buyer TEXT NOT NULL,
  seller TEXT NOT NULL,
  token_a_mint TEXT NOT NULL,
  token_a_amount TEXT NOT NULL,
  token_b_mint TEXT NOT NULL,
  token_b_amount TEXT NOT NULL,
  signature TEXT NOT NULL UNIQUE,
  slot BIGINT NOT NULL,
  executed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for swaps
CREATE INDEX IF NOT EXISTS idx_swaps_buyer ON swaps(buyer);
CREATE INDEX IF NOT EXISTS idx_swaps_seller ON swaps(seller);
CREATE INDEX IF NOT EXISTS idx_swaps_offer_id ON swaps(offer_id);
CREATE INDEX IF NOT EXISTS idx_swaps_executed_at ON swaps(executed_at);

-- Create indexer_state table
CREATE TABLE IF NOT EXISTS indexer_state (
  key TEXT PRIMARY KEY,
  last_processed_slot BIGINT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Initialize indexer state
INSERT INTO indexer_state (key, last_processed_slot)
VALUES ('fair_swap', 0)
ON CONFLICT (key) DO NOTHING;

-- Create auth_nonces table
CREATE TABLE IF NOT EXISTS auth_nonces (
  wallet_address TEXT PRIMARY KEY,
  nonce TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for auth_nonces
CREATE INDEX IF NOT EXISTS idx_auth_nonces_expires_at ON auth_nonces(expires_at);

-- Create auth_sessions table
CREATE TABLE IF NOT EXISTS auth_sessions (
  id SERIAL PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  session_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for auth_sessions
CREATE INDEX IF NOT EXISTS idx_auth_sessions_wallet_address ON auth_sessions(wallet_address);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_session_token ON auth_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_expires_at ON auth_sessions(expires_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_offers_updated_at
  BEFORE UPDATE ON offers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proposals_updated_at
  BEFORE UPDATE ON proposals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_indexer_state_updated_at
  BEFORE UPDATE ON indexer_state
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

