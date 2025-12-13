# FairSwap

AI-powered, trustless peer-to-peer asset exchange platform on Solana.

## Overview

FairSwap enables secure P2P swaps of SPL tokens without intermediaries. Key features:
- **Trustless Locking**: Assets locked in program-controlled vaults
- **Direct Swaps**: Execute fixed-price exchanges atomically
- **Alternative Offers**: Buyers propose different assets, sellers approve
- **AI Valuation**: Real-time fairness scores for trades (Coming soon)

## Project Structure

```
fair-swap/
├── programs/fair-swap/    # Solana program (Rust/Anchor)
├── tests/                 # Integration tests
├── PLAN.md               # Technical plan
└── SPEC.md               # Technical specification
```

## Quick Start

### Prerequisites
- Solana CLI
- Anchor Framework 0.32.1
- Node.js + pnpm

### Build & Test

```bash
# Install dependencies
pnpm install

# Build program
anchor build

# Run tests
anchor test
```

## Program Instructions

### 1. `initialize_offer`
Seller creates an offer, locks Asset A in vault.

### 2. `execute_swap`
Buyer accepts fixed price. Atomic swap executed.

### 3. `submit_proposal`
Buyer proposes alternative Asset C (if enabled by seller).

### 4. `accept_proposal`
Seller accepts alternative offer. Swap executed.

### 5. `cancel_offer`
Seller cancels offer, retrieves locked assets.

### 6. `withdraw_proposal`
Buyer withdraws rejected/pending proposal.

## Current Status

**Phase 1 Complete** ✅
- [x] Solana program core (Rust/Anchor)
- [x] All 6 instructions implemented
- [x] Comprehensive test suite (3/3 passing)
- [x] Direct swap functionality
- [x] Alternative offer negotiation

**Next Steps**
- Frontend (Next.js + shadcn)
- Backend indexer (Node.js + Postgres)
- AI pricing service integration

## Testing

All core instructions tested:
```
✔ Creates an offer
✔ Executes direct swap
✔ Submits and accepts proposal
```

## License

ISC









