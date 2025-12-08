use anchor_lang::prelude::*;
use anchor_spl::token::{self, CloseAccount, Token, TokenAccount, Transfer};

use crate::{Offer, OFFER_SEED, VAULT_SEED};

#[derive(Accounts)]
pub struct ExecuteSwap<'info> {
    #[account(
        mut,
        seeds = [OFFER_SEED, offer.seller.as_ref(), &offer_id_from_offer(&offer)],
        bump = offer.bump,
        close = seller
    )]
    pub offer: Account<'info, Offer>,

    #[account(
        mut,
        seeds = [VAULT_SEED, offer.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, TokenAccount>,

    #[account(mut)]
    pub buyer_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub seller_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub buyer_receive_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub buyer: Signer<'info>,

    /// CHECK: Seller receiving funds
    #[account(mut)]
    pub seller: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<ExecuteSwap>) -> Result<()> {
    let offer = &ctx.accounts.offer;

    // Verify buyer is sending correct token and amount
    require!(
        ctx.accounts.buyer_token_account.mint == offer.token_mint_b,
        ErrorCode::InvalidTokenMint
    );

    // Transfer token B from buyer to seller
    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.buyer_token_account.to_account_info(),
                to: ctx.accounts.seller_token_account.to_account_info(),
                authority: ctx.accounts.buyer.to_account_info(),
            },
        ),
        offer.token_amount_b,
    )?;

    // Transfer token A from vault to buyer
    let seeds = &[
        OFFER_SEED,
        offer.seller.as_ref(),
        &offer_id_from_offer(offer),
        &[offer.bump],
    ];
    let signer_seeds = &[&seeds[..]];

    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.vault.to_account_info(),
                to: ctx.accounts.buyer_receive_account.to_account_info(),
                authority: ctx.accounts.offer.to_account_info(),
            },
            signer_seeds,
        ),
        offer.token_amount_a,
    )?;

    // Close vault account
    token::close_account(CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        CloseAccount {
            account: ctx.accounts.vault.to_account_info(),
            destination: ctx.accounts.seller.to_account_info(),
            authority: ctx.accounts.offer.to_account_info(),
        },
        signer_seeds,
    ))?;

    Ok(())
}

fn offer_id_from_offer(offer: &Offer) -> [u8; 8] {
    offer.offer_id.to_le_bytes()
}

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid token mint")]
    InvalidTokenMint,
}

