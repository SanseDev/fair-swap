use anchor_lang::prelude::*;
use anchor_spl::token::{self, CloseAccount, Token, TokenAccount, Transfer};

use crate::{Proposal, PROPOSAL_SEED, VAULT_SEED};

#[derive(Accounts)]
pub struct WithdrawProposal<'info> {
    #[account(
        mut,
        seeds = [PROPOSAL_SEED, proposal.offer.as_ref(), proposal.buyer.as_ref(), &proposal_id_from_proposal(&proposal)],
        bump = proposal.bump,
        close = buyer
    )]
    pub proposal: Account<'info, Proposal>,

    #[account(
        mut,
        seeds = [VAULT_SEED, proposal.key().as_ref()],
        bump
    )]
    pub proposal_vault: Account<'info, TokenAccount>,

    #[account(mut)]
    pub buyer_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub buyer: Signer<'info>,

    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<WithdrawProposal>) -> Result<()> {
    let proposal = &ctx.accounts.proposal;

    // Verify buyer is the signer
    require!(
        ctx.accounts.buyer.key() == proposal.buyer,
        ErrorCode::UnauthorizedBuyer
    );

    // Transfer tokens back to buyer
    let seeds = &[
        PROPOSAL_SEED,
        proposal.offer.as_ref(),
        proposal.buyer.as_ref(),
        &proposal_id_from_proposal(proposal),
        &[proposal.bump],
    ];
    let signer_seeds = &[&seeds[..]];

    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.proposal_vault.to_account_info(),
                to: ctx.accounts.buyer_token_account.to_account_info(),
                authority: ctx.accounts.proposal.to_account_info(),
            },
            signer_seeds,
        ),
        proposal.proposed_amount,
    )?;

    // Close vault
    token::close_account(CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        CloseAccount {
            account: ctx.accounts.proposal_vault.to_account_info(),
            destination: ctx.accounts.buyer.to_account_info(),
            authority: ctx.accounts.proposal.to_account_info(),
        },
        signer_seeds,
    ))?;

    Ok(())
}

fn proposal_id_from_proposal(proposal: &Proposal) -> [u8; 8] {
    proposal.proposal_id.to_le_bytes()
}

#[error_code]
pub enum ErrorCode {
    #[msg("Only buyer can withdraw proposal")]
    UnauthorizedBuyer,
}

