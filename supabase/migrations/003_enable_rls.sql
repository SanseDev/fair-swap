-- Enable RLS on all tables
ALTER TABLE auth_nonces ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE indexer_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE swaps ENABLE ROW LEVEL SECURITY;

-- auth_nonces: lecture/écriture publique (nécessaire pour le flow d'auth)
CREATE POLICY "Public read access" ON auth_nonces FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON auth_nonces FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete access" ON auth_nonces FOR DELETE USING (true);

-- auth_sessions: lecture publique seulement
CREATE POLICY "Public read sessions" ON auth_sessions FOR SELECT USING (true);

-- indexer_state: lecture publique seulement
CREATE POLICY "Public read indexer state" ON indexer_state FOR SELECT USING (true);

-- offers: lecture publique, tout le reste via backend
CREATE POLICY "Public read offers" ON offers FOR SELECT USING (true);

-- proposals: lecture publique, tout le reste via backend
CREATE POLICY "Public read proposals" ON proposals FOR SELECT USING (true);

-- swaps: lecture publique, tout le reste via backend
CREATE POLICY "Public read swaps" ON swaps FOR SELECT USING (true);

