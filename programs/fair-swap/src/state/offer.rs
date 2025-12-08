use anchor_lang::prelude::*;

#[account]
pub struct Offer {
    pub offer_id: u64,
    pub seller: Pubkey,
    pub token_mint_a: Pubkey,
    pub token_amount_a: u64,
    pub token_mint_b: Pubkey,
    pub token_amount_b: u64,
    pub allow_alternatives: bool,
    pub bump: u8,
}

impl Offer {
    pub const LEN: usize = 8 + 8 + 32 + 32 + 8 + 32 + 8 + 1 + 1;
}

