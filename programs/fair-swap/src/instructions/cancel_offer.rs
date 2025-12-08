use anchor_lang::prelude::*;
use anchor_spl::token::{self, CloseAccount, Token, TokenAccount, Transfer};

use crate::{Offer, OFFER_SEED, VAULT_SEED};

#[derive(Accounts)]
pub struct CancelOffer<'info> {
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
    pub seller_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub seller: Signer<'info>,

    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<CancelOffer>) -> Result<()> {
    let offer = &ctx.accounts.offer;

    // Verify seller is the signer
    require!(
        ctx.accounts.seller.key() == offer.seller,
        ErrorCode::UnauthorizedSeller
    );

    // Transfer tokens back to seller
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
                to: ctx.accounts.seller_token_account.to_account_info(),
                authority: ctx.accounts.offer.to_account_info(),
            },
            signer_seeds,
        ),
        offer.token_amount_a,
    )?;

    // Close vault
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
    #[msg("Only seller can cancel offer")]
    UnauthorizedSeller,
}

