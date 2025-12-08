# SwapLock - Technical Specification

## 1. System Architecture

### 1.1 High-Level Diagram
```
[User Wallet] <-> [Next.js Frontend] <-> [Backend API] <-> [Postgres DB]
       |                  |                    ^
       |                  v                    |
       +-----------> [Solana Blockchain] ------+
                          |
                    [SwapLock Program]
```

### 1.2 Tech Stack
- **Smart Contract**: Rust, Anchor Framework
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express (or Next.js API Routes)
- **Database**: PostgreSQL, Knex.js
- **AI/Pricing**: Python/Node.js Service + Jupiter/Pyth APIs

## 2. Data Models (Database)

### 2.1 Users
```sql
CREATE TABLE users (
  address VARCHAR(44) PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW(),
  reputation_score INT DEFAULT 0
);
```

### 2.2 Offers
```sql
CREATE TABLE offers (
  id SERIAL PRIMARY KEY,
  offer_address VARCHAR(44) UNIQUE NOT NULL, -- PDA
  seller_address VARCHAR(44) NOT NULL REFERENCES users(address),
  token_mint_a VARCHAR(44) NOT NULL,
  token_amount_a BIGINT NOT NULL,
  token_mint_b VARCHAR(44) NOT NULL,
  token_amount_b BIGINT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  allow_alternatives BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 2.3 Proposals (Alternative Offers)
```sql
CREATE TABLE proposals (
  id SERIAL PRIMARY KEY,
  proposal_address VARCHAR(44) UNIQUE NOT NULL, -- PDA
  offer_id INT REFERENCES offers(id),
  buyer_address VARCHAR(44) NOT NULL REFERENCES users(address),
  proposed_mint VARCHAR(44) NOT NULL,
  proposed_amount BIGINT NOT NULL,
  status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, ACCEPTED, REJECTED, WITHDRAWN
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 3. Solana Program Specification

### 3.1 Constants
- `OFFER_TAG`: b"offer"
- `PROPOSAL_TAG`: b"proposal"

### 3.2 Account Structures

**Offer Account**
```rust
#[account]
pub struct Offer {
    pub seller: Pubkey,
    pub token_mint_a: Pubkey,
    pub token_amount_a: u64,
    pub token_mint_b: Pubkey,
    pub token_amount_b: u64,
    pub allow_alternatives: bool,
    pub bump: u8,
}
```

**Proposal Account**
```rust
#[account]
pub struct Proposal {
    pub buyer: Pubkey,
    pub offer: Pubkey, // Reference to the parent Offer
    pub proposed_mint: Pubkey,
    pub proposed_amount: u64,
    pub bump: u8,
}
```

### 3.3 Instructions

**`initialize_offer`**
- **Inputs**: `token_amount_a`, `token_mint_b`, `token_amount_b`, `allow_alternatives`
- **Logic**:
    1. Initialize `Offer` PDA.
    2. Transfer `token_amount_a` from Seller to Vault PDA.

**`execute_swap`**
- **Inputs**: None (uses data from `Offer` account)
- **Logic**:
    1. Verify Buyer sends `token_amount_b` of `token_mint_b`.
    2. Transfer Asset B to Seller.
    3. Transfer Asset A (from Vault) to Buyer.
    4. Close `Offer` account.

**`submit_proposal`**
- **Inputs**: `proposed_amount`, `proposed_mint`
- **Logic**:
    1. Initialize `Proposal` PDA.
    2. Transfer `proposed_amount` from Buyer to Proposal Vault PDA.

**`accept_proposal`**
- **Inputs**: None (Context includes Offer, Proposal, Vaults)
- **Logic**:
    1. Verify `Proposal` is linked to `Offer`.
    2. Transfer Asset C (Proposal Vault) to Seller.
    3. Transfer Asset A (Offer Vault) to Buyer.
    4. Close `Offer` and `Proposal` accounts.

## 4. AI & Fairness Module

### 4.1 Logic
- Input: `Token A`, `Amount A`, `Token B`, `Amount B`
- Process:
    1. Fetch Price(A) in USD via Jupiter API.
    2. Fetch Price(B) in USD via Jupiter API.
    3. Calculate `Ratio = (Value A) / (Value B)`.
- Output:
    - `fairness_score`: 0-100 (100 is perfectly equal value).
    - `recommendation`: "Fair", "Seller Favored", "Buyer Favored".

## 5. Security Considerations
- **PDA Validation**: Ensure all accounts are derived correctly.
- **Token Checks**: Explicitly check mint addresses and token programs.
- **Closing Accounts**: Ensure rent is returned to the correct user (Seller closes Offer, Buyer closes Proposal).

