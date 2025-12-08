use anchor_lang::prelude::*;
use anchor_spl::token::{self, CloseAccount, Token, TokenAccount, Transfer};

use crate::{Offer, Proposal, OFFER_SEED, PROPOSAL_SEED, VAULT_SEED};

#[derive(Accounts)]
pub struct AcceptProposal<'info> {
    #[account(
        mut,
        seeds = [OFFER_SEED, offer.seller.as_ref(), &offer_id_from_offer(&offer)],
        bump = offer.bump,
        close = seller
    )]
    pub offer: Account<'info, Offer>,

    #[account(
        mut,
        seeds = [PROPOSAL_SEED, offer.key().as_ref(), proposal.buyer.as_ref(), &proposal_id_from_proposal(&proposal)],
        bump = proposal.bump,
        close = buyer_account
    )]
    pub proposal: Account<'info, Proposal>,

    #[account(
        mut,
        seeds = [VAULT_SEED, offer.key().as_ref()],
        bump
    )]
    pub offer_vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [VAULT_SEED, proposal.key().as_ref()],
        bump
    )]
    pub proposal_vault: Account<'info, TokenAccount>,

    #[account(mut)]
    pub seller_receive_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub buyer_receive_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub seller: Signer<'info>,

    /// CHECK: Buyer receiving rent refund
    #[account(mut)]
    pub buyer_account: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<AcceptProposal>) -> Result<()> {
    let offer = &ctx.accounts.offer;
    let proposal = &ctx.accounts.proposal;

    // Verify seller is the signer
    require!(
        ctx.accounts.seller.key() == offer.seller,
        ErrorCode::UnauthorizedSeller
    );

    // Transfer proposed tokens from proposal vault to seller
    let offer_key = offer.key();
    let proposal_seeds = &[
        PROPOSAL_SEED,
        offer_key.as_ref(),
        proposal.buyer.as_ref(),
        &proposal_id_from_proposal(proposal),
        &[proposal.bump],
    ];
    let proposal_signer_seeds = &[&proposal_seeds[..]];

    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.proposal_vault.to_account_info(),
                to: ctx.accounts.seller_receive_account.to_account_info(),
                authority: ctx.accounts.proposal.to_account_info(),
            },
            proposal_signer_seeds,
        ),
        proposal.proposed_amount,
    )?;

    // Transfer offer tokens from offer vault to buyer
    let offer_seeds = &[
        OFFER_SEED,
        offer.seller.as_ref(),
        &offer_id_from_offer(offer),
        &[offer.bump],
    ];
    let offer_signer_seeds = &[&offer_seeds[..]];

    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.offer_vault.to_account_info(),
                to: ctx.accounts.buyer_receive_account.to_account_info(),
                authority: ctx.accounts.offer.to_account_info(),
            },
            offer_signer_seeds,
        ),
        offer.token_amount_a,
    )?;

    // Close both vaults
    token::close_account(CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        CloseAccount {
            account: ctx.accounts.offer_vault.to_account_info(),
            destination: ctx.accounts.seller.to_account_info(),
            authority: ctx.accounts.offer.to_account_info(),
        },
        offer_signer_seeds,
    ))?;

    token::close_account(CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        CloseAccount {
            account: ctx.accounts.proposal_vault.to_account_info(),
            destination: ctx.accounts.buyer_account.to_account_info(),
            authority: ctx.accounts.proposal.to_account_info(),
        },
        proposal_signer_seeds,
    ))?;

    Ok(())
}

fn offer_id_from_offer(offer: &Offer) -> [u8; 8] {
    offer.offer_id.to_le_bytes()
}

fn proposal_id_from_proposal(proposal: &Proposal) -> [u8; 8] {
    proposal.proposal_id.to_le_bytes()
}

#[error_code]
pub enum ErrorCode {
    #[msg("Only seller can accept proposals")]
    UnauthorizedSeller,
}

