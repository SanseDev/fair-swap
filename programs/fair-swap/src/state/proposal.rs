use anchor_lang::prelude::*;

#[account]
pub struct Proposal {
    pub proposal_id: u64,
    pub buyer: Pubkey,
    pub offer: Pubkey,
    pub proposed_mint: Pubkey,
    pub proposed_amount: u64,
    pub bump: u8,
}

impl Proposal {
    pub const LEN: usize = 8 + 8 + 32 + 32 + 32 + 8 + 1;
}

