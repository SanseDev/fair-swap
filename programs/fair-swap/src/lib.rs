pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("GUijjz5VNLUkPSw9KKvH5ntUNoJuSDbWQDXZSrQgx9fW");

#[program]
pub mod fair_swap {
    use super::*;

    pub fn initialize_offer(
        ctx: Context<InitializeOffer>,
        offer_id: u64,
        token_amount_a: u64,
        token_mint_b: Pubkey,
        token_amount_b: u64,
        allow_alternatives: bool,
    ) -> Result<()> {
        initialize_offer::handler(ctx, offer_id, token_amount_a, token_mint_b, token_amount_b, allow_alternatives)
    }

    pub fn cancel_offer(ctx: Context<CancelOffer>) -> Result<()> {
        cancel_offer::handler(ctx)
    }

    pub fn execute_swap(ctx: Context<ExecuteSwap>) -> Result<()> {
        execute_swap::handler(ctx)
    }

    pub fn submit_proposal(
        ctx: Context<SubmitProposal>,
        proposal_id: u64,
        proposed_amount: u64,
    ) -> Result<()> {
        submit_proposal::handler(ctx, proposal_id, proposed_amount)
    }

    pub fn accept_proposal(ctx: Context<AcceptProposal>) -> Result<()> {
        accept_proposal::handler(ctx)
    }

    pub fn withdraw_proposal(ctx: Context<WithdrawProposal>) -> Result<()> {
        withdraw_proposal::handler(ctx)
    }
}
