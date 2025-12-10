# FairSwap Backend & Indexer

Backend service and blockchain indexer for FairSwap - A trustless P2P asset exchange on Solana.

## Features

- **Solana Indexer**: Monitors and indexes all program transactions
- **Postgres Database**: Stores indexed offers, proposals, and swaps
- **REST API**: Query indexed data via clean REST endpoints
- **Repository Pattern**: Clean data access layer
- **TypeScript**: Full type safety

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- pnpm

### Installation

```bash
cd backend
pnpm install
```

### Configuration

Create a `.env` file:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fair_swap
SOLANA_RPC_URL=http://127.0.0.1:8899
PROGRAM_ID=GUijjz5VNLUkPSw9KKvH5ntUNoJuSDbWQDXZSrQgx9fW
API_PORT=3000
```

### Database Setup

Run migrations:

```bash
pnpm migrate:latest
```

Rollback migrations:

```bash
pnpm migrate:rollback
```

## Running

### Start API Server

```bash
pnpm dev
```

API will be available at `http://localhost:3000`

### Start Indexer

```bash
pnpm index:start
```

## API Endpoints

### Offers

- `GET /api/offers` - Get all offers
- `GET /api/offers/active` - Get active offers
- `GET /api/offers/:id` - Get offer by ID
- `GET /api/offers/seller/:seller` - Get offers by seller

Query parameters:
- `limit` - Number of results (default: 100)
- `offset` - Pagination offset (default: 0)
- `status` - Filter by status (active/cancelled/completed)
- `seller` - Filter by seller address
- `token_mint_a` - Filter by token A mint
- `token_mint_b` - Filter by token B mint

### Proposals

- `GET /api/proposals` - Get all proposals
- `GET /api/proposals/pending` - Get pending proposals
- `GET /api/proposals/:id` - Get proposal by ID
- `GET /api/proposals/buyer/:buyer` - Get proposals by buyer
- `GET /api/proposals/offer/:offer_id` - Get proposals by offer

Query parameters:
- `limit` - Number of results (default: 100)
- `offset` - Pagination offset (default: 0)
- `status` - Filter by status (pending/accepted/withdrawn)
- `buyer` - Filter by buyer address
- `offer_id` - Filter by offer ID

### Swaps

- `GET /api/swaps` - Get all swaps
- `GET /api/swaps/recent` - Get recent swaps
- `GET /api/swaps/stats` - Get swap statistics
- `GET /api/swaps/:id` - Get swap by ID
- `GET /api/swaps/buyer/:buyer` - Get swaps by buyer
- `GET /api/swaps/seller/:seller` - Get swaps by seller

Query parameters:
- `limit` - Number of results (default: 100)
- `buyer` - Filter by buyer address
- `seller` - Filter by seller address
- `offer_id` - Filter by offer ID

### Health

- `GET /health` - Health check

## Architecture

```
backend/
├── src/
│   ├── api/                  # REST API layer
│   │   ├── routes/          # Route handlers
│   │   └── server.ts        # Fastify server setup
│   ├── config/              # Configuration
│   │   ├── database.ts      # Knex setup
│   │   └── env.ts           # Environment variables
│   ├── database/            # Database layer
│   │   └── migrations/      # Knex migrations
│   ├── indexer/             # Solana indexer
│   │   ├── indexer.ts       # Main indexer logic
│   │   ├── parser.ts        # Instruction parser
│   │   └── processor.ts     # Transaction processor
│   ├── repositories/        # Data access layer
│   │   ├── base.repository.ts
│   │   ├── offer.repository.ts
│   │   ├── proposal.repository.ts
│   │   └── swap.repository.ts
│   ├── types/               # TypeScript types
│   └── index.ts             # API entry point
├── package.json
└── tsconfig.json
```

## Development

Build:

```bash
pnpm build
```

Production:

```bash
pnpm start
```




