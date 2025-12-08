# SwapLock - Technical Plan

## 1. Project Overview
**SwapLock** is an AI-powered, trustless peer-to-peer exchange platform on Solana. It enables users to swap digital assets securely without an intermediary. Key features include on-chain asset locking, support for alternative counter-offers, and an AI module that provides real-time "Fairness Scores" for trades.

## 2. Supported Assets (MVP)
*   **Fungible Tokens (SPL)**: USDC, BONK, JUP, etc.
*   **Native SOL**: Wrapped as wSOL for uniform handling.
*   *Note: NFT support is deferred to post-MVP to focus on accurate AI pricing models first.*

## 3. User Flow

### A. Offer Creation (Seller)
1.  Seller connects wallet.
2.  Selects **Asset A** (Token to sell) and amount.
3.  Defines **Asset B** (Token requested) and amount.
4.  Optionally enables **"Allow Alternative Offers"**.
5.  **Action**: Program locks Asset A in a PDA Vault.

### B. Discovery & Valuation
1.  Buyers browse active offers.
2.  **AI Module** compares value of Asset A vs. Asset B using live price feeds.
3.  Displays a **Fairness Score** (e.g., "Good Deal", "Overpriced").

### C. Execution Path 1: Direct Swap
1.  Buyer accepts the fixed price.
2.  **Action**: Buyer sends Asset B. Program performs atomic swap (A $\to$ Buyer, B $\to$ Seller).
3.  Offer is closed.

### D. Execution Path 2: Alternative Offer (Negotiation)
1.  Buyer proposes **Asset C** (different token/amount).
2.  **Action**: Program locks Asset C in a Proposal Vault (spam prevention).
3.  Seller views proposal + AI Fairness Score for Asset C.
4.  **If Seller Accepts**: Atomic swap executes (A $\to$ Buyer, C $\to$ Seller).
5.  **If Seller Rejects**: Asset C is refunded to Buyer.

### E. Cancellation
1.  Seller can cancel and withdraw Asset A if no swap has occurred.
2.  Buyers can withdraw pending proposals if not yet accepted.

## 4. Technical Architecture

### Stack
*   **Blockchain**: Solana (Rust + Anchor Framework)
*   **Frontend**: Next.js 14 (App Router), TypeScript, pnpm
*   **UI Framework**: Tailwind CSS, shadcn/ui, Magic UI
*   **Backend/Indexer**: Node.js
*   **Database**: PostgreSQL + Knex (Repository Pattern)
*   **AI Engine**: Serverless function (Python/Node) + Jupiter/Pyth API + LLM

### Solana Program Design (Anchor)

#### Accounts
*   `Offer`: `seller_pubkey`, `token_mint_a`, `token_amount_a`, `requested_mint_b`, `requested_amount_b`, `allow_alternatives`, `state` (Open/Locked/Closed).
*   `Proposal`: `buyer_pubkey`, `offer_pubkey`, `proposed_mint`, `proposed_amount`, `state` (Pending/Accepted/Rejected).
*   `Vault`: PDA to hold locked assets.

#### Instructions
1.  `initialize_offer`: Lock Asset A.
2.  `cancel_offer`: Refund Asset A.
3.  `execute_direct_swap`: Swap A $\leftrightarrow$ B.
4.  `submit_proposal`: Lock Asset C.
5.  `accept_proposal`: Swap A $\leftrightarrow$ C.
6.  `withdraw_proposal`: Refund Asset C.

### Database Schema (Postgres)
*   **users**: `address` (PK), `reputation_score`
*   **offers**: `id`, `on_chain_address`, `seller_address`, `token_a`, `amount_a`, `token_b`, `amount_b`, `status`
*   **proposals**: `id`, `on_chain_address`, `offer_id` (FK), `buyer_address`, `token_c`, `amount_c`, `status`

## 5. Implementation Phases

### Phase 1: Solana Core (TDD)
*   Setup Anchor workspace.
*   Implement `Offer` account & locking logic.
*   Implement `execute_direct_swap`.
*   **Milestone**: Working atomic swap for fixed pairs.

### Phase 2: Negotiation Logic
*   Implement `Proposal` accounts.
*   Implement `submit_proposal` and `accept_proposal` logic.
*   **Milestone**: Full "Make an Offer" flow works on Devnet.

### Phase 3: Backend & Indexer
*   Setup Postgres + Knex.
*   Build indexer to sync on-chain state to DB.
*   Create REST API for fast filtering/searching.

### Phase 4: Frontend & AI Integration
*   Build UI with Next.js + shadcn.
*   Implement AI Price Service (Jupiter API wrapper).
*   Integrate Wallet Adapter.
*   **Milestone**: Functional Prototype.

