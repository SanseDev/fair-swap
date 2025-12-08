use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

use crate::{Offer, OFFER_SEED, VAULT_SEED};

#[derive(Accounts)]
#[instruction(offer_id: u64)]
pub struct InitializeOffer<'info> {
    #[account(
        init,
        payer = seller,
        space = Offer::LEN,
        seeds = [OFFER_SEED, seller.key().as_ref(), &offer_id.to_le_bytes()],
        bump
    )]
    pub offer: Account<'info, Offer>,

    #[account(
        init,
        payer = seller,
        token::mint = token_mint_a,
        token::authority = offer,
        seeds = [VAULT_SEED, offer.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, TokenAccount>,

    #[account(mut)]
    pub seller_token_account: Account<'info, TokenAccount>,

    /// CHECK: Just a mint address
    pub token_mint_a: AccountInfo<'info>,

    #[account(mut)]
    pub seller: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(
    ctx: Context<InitializeOffer>,
    offer_id: u64,
    token_amount_a: u64,
    token_mint_b: Pubkey,
    token_amount_b: u64,
    allow_alternatives: bool,
) -> Result<()> {
    let offer = &mut ctx.accounts.offer;
    offer.offer_id = offer_id;
    offer.seller = ctx.accounts.seller.key();
    offer.token_mint_a = ctx.accounts.token_mint_a.key();
    offer.token_amount_a = token_amount_a;
    offer.token_mint_b = token_mint_b;
    offer.token_amount_b = token_amount_b;
    offer.allow_alternatives = allow_alternatives;
    offer.bump = ctx.bumps.offer;

    // Transfer tokens from seller to vault
    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.seller_token_account.to_account_info(),
                to: ctx.accounts.vault.to_account_info(),
                authority: ctx.accounts.seller.to_account_info(),
            },
        ),
        token_amount_a,
    )?;

    Ok(())
}

