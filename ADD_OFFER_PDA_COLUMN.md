# Ajouter la colonne offer_pda

**IMPORTANT:** Exécute cette commande SQL dans le dashboard Supabase (SQL Editor) :

```sql
-- Add offer_pda column to offers table
ALTER TABLE offers ADD COLUMN IF NOT EXISTS offer_pda TEXT;

-- Add index for faster lookups by PDA
CREATE INDEX IF NOT EXISTS idx_offers_offer_pda ON offers(offer_pda);
```

Une fois fait, redémarre l'indexer pour qu'il commence à stocker les PDA des nouvelles offres.

Les anciennes offres n'auront pas de PDA, mais les nouvelles en auront et les propositions fonctionneront !

