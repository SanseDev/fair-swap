# Supabase Setup Instructions

## 1. Configuration des Variables d'Environnement

Ajoutez ces variables à votre fichier `.env` :

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Solana Configuration
SOLANA_RPC_URL=http://127.0.0.1:8899
PROGRAM_ID=GUijjz5VNLUkPSw9KKvH5ntUNoJuSDbWQDXZSrQgx9fW

# API Configuration
API_PORT=3001
```

## 2. Création du Schéma dans Supabase

### Option 1: Via le SQL Editor de Supabase

1. Allez sur https://supabase.com/dashboard/project/_/sql/new
2. Copiez le contenu du fichier `supabase/migrations/001_initial_schema.sql`
3. Exécutez le SQL dans l'éditeur

### Option 2: Via le script de setup

```bash
pnpm run db:setup
```

Ce script affichera le SQL à exécuter dans l'éditeur Supabase.

## 3. Vérification de la Connexion

Le script `db:setup` teste automatiquement la connexion à Supabase après avoir affiché le SQL.

## 4. Structure de la Base de Données

Le schéma crée les tables suivantes :

- **offers** : Offres d'échange créées par les utilisateurs
- **proposals** : Propositions alternatives pour les offres
- **swaps** : Historique des échanges complétés
- **indexer_state** : État de synchronisation de l'indexer
- **auth_nonces** : Nonces pour l'authentification des wallets
- **auth_sessions** : Sessions d'authentification actives

## 5. Vérification de la Configuration

Une fois les tables créées, vérifie que tout fonctionne :

```bash
# Teste la connexion et vérifie les tables
pnpm run db:test

# Vérifie toute la configuration
pnpm run check
```

Tu devrais voir toutes les tables avec ✅.

## 6. Lancement de l'Application

```bash
# Développement (backend + frontend)
pnpm dev

# Backend seul
pnpm dev:backend

# Frontend seul
pnpm dev:web

# Indexer (IMPORTANT : doit tourner pour indexer les transactions blockchain)
pnpm index:start
```

**⚠️ IMPORTANT** : L'indexer doit tourner en arrière-plan pour que les offres/swaps/proposals apparaissent dans la DB.

## 7. Troubleshooting

Si les offres ne s'affichent pas après création, consulte `TROUBLESHOOTING.md`.

Checklist rapide :
- ✅ Tables créées dans Supabase (`pnpm run db:test`)
- ✅ Variables d'environnement configurées
- ✅ **L'indexer tourne** (`pnpm index:start`)
- ✅ Une transaction a été créée sur la blockchain
- ✅ Le `PROGRAM_ID` correspond au programme déployé

## Notes Importantes

- **SUPABASE_SERVICE_ROLE_KEY** : Utilisée par le backend et l'indexer (jamais exposée au frontend)
- **SUPABASE_ANON_KEY** : Peut être utilisée par le frontend si nécessaire
- Les tables sont automatiquement créées avec des triggers pour `updated_at`
- L'indexer utilise la table `indexer_state` pour reprendre où il s'est arrêté
- **L'indexer doit tourner pour que les transactions blockchain soient indexées dans Supabase**

