# FairSwap

Trustless peer-to-peer asset exchange platform on Solana with AI-powered valuation.

## Overview

FairSwap enables secure P2P swaps of SPL tokens and NFTs without intermediaries. Built with Solana's Anchor framework for atomic transactions and enhanced with real-time indexing and AI-powered trade fairness analysis.

**Key Features:**
- **Trustless Locking**: Assets secured in program-controlled vaults
- **Atomic Swaps**: Direct fixed-price exchanges executed atomically
- **Alternative Offers**: Buyers propose different assets, sellers approve or reject
- **Real-time Indexing**: PostgreSQL-backed indexer tracks all on-chain activity
- **AI Valuation**: Fairness scores for trades *(coming soon)*

## Architecture

```
fair-swap/
├── programs/fair-swap/      # Solana program (Rust/Anchor)
├── backend-src/             # Backend API + Indexer
│   ├── api/                 # Fastify REST API
│   ├── indexer/             # Blockchain event indexer
│   ├── repositories/        # Database access layer
│   └── database/            # Migrations & DB config
├── src/                     # Next.js frontend
│   ├── app/                 # App router pages
│   ├── components/          # React components
│   ├── hooks/               # Custom React hooks
│   └── lib/                 # Utilities & helpers
└── tests/                   # Integration tests
```

## Tech Stack

**Blockchain:**
- Solana (Web3.js)
- Anchor Framework 0.32.1
- SPL Token Program

**Backend:**
- Node.js + TypeScript
- Fastify (REST API)
- PostgreSQL + Knex.js
- JWT Authentication

**Frontend:**
- Next.js 16
- React 19
- TanStack Query
- shadcn/ui + Tailwind CSS
- Solana Wallet Adapter

## Prerequisites

- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools)
- [Anchor Framework 0.32.1](https://www.anchor-lang.com/docs/installation)
- [Node.js](https://nodejs.org/) (v18+)
- [pnpm](https://pnpm.io/)
- [PostgreSQL](https://www.postgresql.org/) (v14+)
- [Docker](https://www.docker.com/) *(optional, for local DB)*

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Setup Database

Start PostgreSQL (Docker):
```bash
docker-compose up -d
```

Run migrations:
```bash
pnpm migrate:latest
```

### 3. Configure Environment

Create `.env` file:
```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fairswap

# Solana
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_PROGRAM_ID=DMpk34ArT3Z8nXtZgQXftWhKNq5MAkMcieEFnUQW7oCU

# Backend
PORT=3001
JWT_SECRET=your-secret-key
```

### 4. Build Program

```bash
anchor build
```

Deploy to devnet:
```bash
anchor deploy --provider.cluster devnet
```

### 5. Run Application

Development (backend + frontend):
```bash
pnpm dev
```

Or run separately:
```bash
# Backend API
pnpm dev:backend

# Frontend
pnpm dev:web

# Indexer
pnpm index:start
```

Production:
```bash
pnpm build
pnpm start
```

## Program Instructions

### `initialize_offer`
Seller creates an offer, locks Asset A in program vault.

**Parameters:**
- `offered_mint`: Asset being offered
- `offered_amount`: Amount of offered asset
- `requested_mint`: Desired asset in return
- `requested_amount`: Desired amount
- `allow_proposals`: Enable alternative offers

### `execute_swap`
Buyer accepts the exact offer. Atomic swap executed immediately.

### `submit_proposal`
Buyer proposes alternative Asset C (if proposals enabled).

### `accept_proposal`
Seller accepts alternative offer. Swap executed atomically.

### `cancel_offer`
Seller cancels offer and retrieves locked assets.

### `withdraw_proposal`
Buyer withdraws rejected or pending proposal assets.

## API Endpoints

### Authentication
- `POST /api/auth/challenge` - Request auth challenge
- `POST /api/auth/verify` - Verify signature & get JWT

### Offers
- `GET /api/offers` - List all active offers
- `GET /api/offers/:id` - Get offer details
- `POST /api/offers` - Create offer *(on-chain + indexer sync)*

### Proposals
- `GET /api/proposals` - List proposals
- `POST /api/proposals` - Submit proposal

### Swaps
- `GET /api/swaps` - Get swap history
- `GET /api/swaps/stats` - Get swap statistics

## Database Schema

**Tables:**
- `offers` - Active and historical offers
- `proposals` - Alternative offer proposals
- `swaps` - Completed swap records
- `indexer_state` - Blockchain sync state

**Repository Pattern:**
- Base repository with common CRUD operations
- Specialized repositories for each entity
- Transaction support via Knex

## Scripts

```bash
# Development
pnpm dev              # Run backend + frontend
pnpm dev:backend      # Backend API only
pnpm dev:web          # Frontend only

# Build
pnpm build            # Build all
pnpm build:backend    # Build backend
pnpm build:web        # Build frontend

# Database
pnpm migrate:latest   # Run migrations
pnpm migrate:rollback # Rollback last migration

# Indexer
pnpm index:start      # Start blockchain indexer

# Testing
anchor test           # Run Anchor tests
pnpm lint             # Run linter
pnpm lint:fix         # Fix linting issues
```

## Testing

Program tests (Anchor):
```bash
anchor test
```

**Current Test Coverage:**
- ✅ Create offer with locked assets
- ✅ Execute direct swap atomically
- ✅ Submit and accept proposal flow
- ✅ Cancel offer and retrieve assets
- ✅ Withdraw proposal

## Project Status

**✅ Phase 1: Core Program**
- [x] Solana program (6 instructions)
- [x] Comprehensive test suite
- [x] Direct swap functionality
- [x] Alternative offer negotiation

**✅ Phase 2: Backend Infrastructure**
- [x] REST API with Fastify
- [x] PostgreSQL database + migrations
- [x] Repository pattern implementation
- [x] JWT authentication
- [x] Blockchain indexer

**✅ Phase 3: Frontend**
- [x] Next.js application
- [x] Wallet integration
- [x] Marketplace UI
- [x] Offer creation & management
- [x] Proposal system
- [x] Dashboard & analytics

**🚧 Phase 4: AI & Enhancement**
- [ ] AI fairness scoring
- [ ] Price prediction models
- [ ] Advanced analytics
- [ ] Real-time notifications

## Development Principles

- **DRY** (Don't Repeat Yourself)
- **KISS** (Keep It Simple, Stupid)
- **SOLID** principles
- Repository pattern for data access
- Component-based architecture
- Type-safe development (TypeScript)

## Deployment

### Solana Program

Devnet:
```bash
anchor deploy --provider.cluster devnet
```

Mainnet:
```bash
anchor deploy --provider.cluster mainnet-beta
```

### Backend & Frontend

Recommended: [Vercel](https://vercel.com) for Next.js + [Railway](https://railway.app) for backend

Environment variables required:
- `DATABASE_URL`
- `SOLANA_RPC_URL`
- `SOLANA_PROGRAM_ID`
- `JWT_SECRET`

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

## License

ISC

## Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review Anchor/Solana docs for program-related questions

---

**Built with ❤️ on Solana**
