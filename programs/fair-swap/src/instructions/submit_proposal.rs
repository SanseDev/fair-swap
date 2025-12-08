use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

use crate::{Offer, Proposal, PROPOSAL_SEED, VAULT_SEED};

#[derive(Accounts)]
#[instruction(proposal_id: u64)]
pub struct SubmitProposal<'info> {
    #[account(
        constraint = offer.allow_alternatives @ ErrorCode::AlternativesNotAllowed
    )]
    pub offer: Account<'info, Offer>,

    #[account(
        init,
        payer = buyer,
        space = Proposal::LEN,
        seeds = [PROPOSAL_SEED, offer.key().as_ref(), buyer.key().as_ref(), &proposal_id.to_le_bytes()],
        bump
    )]
    pub proposal: Account<'info, Proposal>,

    #[account(
        init,
        payer = buyer,
        token::mint = proposed_mint,
        token::authority = proposal,
        seeds = [VAULT_SEED, proposal.key().as_ref()],
        bump
    )]
    pub proposal_vault: Account<'info, TokenAccount>,

    #[account(mut)]
    pub buyer_token_account: Account<'info, TokenAccount>,

    /// CHECK: Just a mint address
    pub proposed_mint: AccountInfo<'info>,

    #[account(mut)]
    pub buyer: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(
    ctx: Context<SubmitProposal>,
    proposal_id: u64,
    proposed_amount: u64,
) -> Result<()> {
    let proposal = &mut ctx.accounts.proposal;
    proposal.proposal_id = proposal_id;
    proposal.buyer = ctx.accounts.buyer.key();
    proposal.offer = ctx.accounts.offer.key();
    proposal.proposed_mint = ctx.accounts.proposed_mint.key();
    proposal.proposed_amount = proposed_amount;
    proposal.bump = ctx.bumps.proposal;

    // Lock proposed tokens in vault
    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.buyer_token_account.to_account_info(),
                to: ctx.accounts.proposal_vault.to_account_info(),
                authority: ctx.accounts.buyer.to_account_info(),
            },
        ),
        proposed_amount,
    )?;

    Ok(())
}

#[error_code]
pub enum ErrorCode {
    #[msg("Offer does not allow alternative proposals")]
    AlternativesNotAllowed,
}

