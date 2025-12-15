# 🔧 Troubleshooting - Fair Swap

## Problème : Les offres créées ne s'affichent pas

### Diagnostic

#### 1. Vérifier que Supabase est connecté
```bash
pnpm run db:test
```

Vous devriez voir :
- ✅ Toutes les tables sont OK
- ✅ L'INSERT fonctionne
- 📊 Le nombre d'offres/swaps/proposals

---

#### 2. Vérifier que l'indexer tourne
```bash
pnpm index:start
```

Vous devriez voir :
```
🚀 Starting FairSwap Indexer...
   Program ID: YOUR_PROGRAM_ID
   RPC URL: http://...
   Last processed slot: X
   ✅ Successfully connected to Supabase
   👀 Watching for transactions...
```

**Si vous voyez des erreurs ici**, vérifiez :
- ✅ `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` dans `.env`
- ✅ Les tables sont créées dans Supabase

---

#### 3. Vérifier que des transactions existent sur la blockchain

L'indexer ne peut sauvegarder que les transactions qui existent réellement sur Solana.

**Testez en créant une offre** :
1. Lance le frontend : `pnpm dev:web`
2. Connecte ton wallet
3. Crée une offre
4. Regarde les logs de l'indexer

**Dans les logs de l'indexer, tu devrais voir** :
```
📥 Processing X new transactions...
📝 Processing instruction: initialize_offer (slot: XXX, sig: XXXXX...)
   💾 Saving offer to DB: { offer_id: '...', seller: '...', ... }
   ✅ Indexed offer creation: ...
```

**Si tu ne vois RIEN** :
- L'indexer ne trouve pas les transactions
- Vérifie que `PROGRAM_ID` dans `.env` correspond à ton programme déployé
- Vérifie que tu es sur le bon réseau (devnet/mainnet/localhost)

---

#### 4. Vérifier le PROGRAM_ID

```bash
# Dans ton .env
PROGRAM_ID=GUijjz5VNLUkPSw9KKvH5ntUNoJuSDbWQDXZSrQgx9fW

# Doit correspondre au program_id dans Anchor.toml
grep "fair_swap = " Anchor.toml
```

Si ce n'est pas le même, **mets à jour ton `.env`**.

---

#### 5. Vérifier le RPC URL

```bash
# Si tu es en LOCAL (solana-test-validator)
SOLANA_RPC_URL=http://127.0.0.1:8899

# Si tu es en DEVNET
SOLANA_RPC_URL=https://api.devnet.solana.com

# Vérifie que le validator tourne
solana-test-validator --version
```

---

### Solutions rapides

#### Réinitialiser l'indexer
Si l'indexer a manqué des transactions, tu peux le réinitialiser :

```sql
-- Dans Supabase SQL Editor
UPDATE indexer_state 
SET last_processed_slot = 0 
WHERE key = 'fair_swap';
```

Puis relance l'indexer : `pnpm index:start`

---

#### Vérifier manuellement les transactions

```bash
# Vérifie que ton programme a des transactions
solana program show YOUR_PROGRAM_ID

# Ou via l'exploreur Solana
https://explorer.solana.com/address/YOUR_PROGRAM_ID?cluster=devnet
```

---

### Checklist complète

- [ ] ✅ Supabase connecté (`pnpm run db:test`)
- [ ] ✅ Tables créées dans Supabase
- [ ] ✅ Variables d'environnement configurées (`.env`)
  - [ ] SUPABASE_URL
  - [ ] SUPABASE_SERVICE_ROLE_KEY
  - [ ] PROGRAM_ID (correspond à Anchor.toml)
  - [ ] SOLANA_RPC_URL (réseau correct)
- [ ] ✅ L'indexer démarre sans erreur (`pnpm index:start`)
- [ ] ✅ Une transaction a été créée sur la blockchain
- [ ] ✅ L'indexer log l'indexation de la transaction

---

### Flux complet

```mermaid
User → Frontend → Blockchain (Solana) → Indexer → Supabase → Frontend
```

1. **User crée une offre** via le frontend
2. **Frontend** envoie une transaction à Solana
3. **Blockchain** exécute et confirme la transaction
4. **Indexer** écoute les nouvelles transactions du programme
5. **Indexer** parse et sauvegarde dans Supabase
6. **Frontend** lit les données depuis l'API (qui lit Supabase)

**Si une étape échoue, les suivantes ne fonctionneront pas.**

---

### Debug avancé

#### Activer les logs détaillés de l'indexer

L'indexer a maintenant des logs détaillés. Regarde-les attentivement :

```bash
pnpm index:start

# Tu devrais voir pour chaque transaction:
📥 Processing X new transactions...
📝 Processing instruction: initialize_offer
   💾 Saving offer to DB: {...}
   ✅ Indexed offer creation: 123

# En cas d'erreur:
❌ Failed to process initialize_offer:
   Error message: ...
   Stack: ...
```

---

### Besoin d'aide ?

Si après tous ces tests, ça ne fonctionne toujours pas :
1. Partage les logs de `pnpm index:start`
2. Partage le résultat de `pnpm run db:test`
3. Vérifie que tu as bien créé une transaction sur la blockchain

