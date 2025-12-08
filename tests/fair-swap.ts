import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { FairSwap } from "../target/types/fair_swap";
import { 
  createMint, 
  getOrCreateAssociatedTokenAccount, 
  mintTo,
  getAccount,
} from "@solana/spl-token";
import { assert } from "chai";

describe("fair-swap", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.FairSwap as Program<FairSwap>;
  const connection = provider.connection;
  const payer = provider.wallet as anchor.Wallet;

  let tokenMintA: anchor.web3.PublicKey;
  let tokenMintB: anchor.web3.PublicKey;
  let sellerTokenAccountA: any;
  let sellerTokenAccountB: any;
  let buyerTokenAccountA: any;
  let buyerTokenAccountB: any;
  
  const seller = payer;
  const buyer = anchor.web3.Keypair.generate();
  const offerId = new anchor.BN(1);

  before(async () => {
    // Airdrop SOL to buyer
    const airdropSig = await connection.requestAirdrop(
      buyer.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(airdropSig);

    // Create token mints
    tokenMintA = await createMint(
      connection,
      payer.payer,
      payer.publicKey,
      null,
      6
    );

    tokenMintB = await createMint(
      connection,
      payer.payer,
      payer.publicKey,
      null,
      6
    );

    // Create token accounts for seller
    sellerTokenAccountA = await getOrCreateAssociatedTokenAccount(
      connection,
      payer.payer,
      tokenMintA,
      seller.publicKey
    );

    sellerTokenAccountB = await getOrCreateAssociatedTokenAccount(
      connection,
      payer.payer,
      tokenMintB,
      seller.publicKey
    );

    // Create token accounts for buyer
    buyerTokenAccountA = await getOrCreateAssociatedTokenAccount(
      connection,
      payer.payer,
      tokenMintA,
      buyer.publicKey
    );

    buyerTokenAccountB = await getOrCreateAssociatedTokenAccount(
      connection,
      payer.payer,
      tokenMintB,
      buyer.publicKey
    );

    // Mint tokens to seller (100 tokenA)
    await mintTo(
      connection,
      payer.payer,
      tokenMintA,
      sellerTokenAccountA.address,
      payer.publicKey,
      100_000_000 // 100 tokens with 6 decimals
    );

    // Mint tokens to buyer (50 tokenB)
    await mintTo(
      connection,
      payer.payer,
      tokenMintB,
      buyerTokenAccountB.address,
      payer.publicKey,
      50_000_000 // 50 tokens with 6 decimals
    );
  });

  it("Creates an offer", async () => {
    const [offerPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("offer"),
        seller.publicKey.toBuffer(),
        offerId.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    const [vaultPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), offerPda.toBuffer()],
      program.programId
    );

    await program.methods
      .initializeOffer(
        offerId,
        new anchor.BN(10_000_000), // 10 tokenA
        tokenMintB,
        new anchor.BN(5_000_000), // 5 tokenB
        false // no alternatives
      )
      .accounts({
        sellerTokenAccount: sellerTokenAccountA.address,
        tokenMintA: tokenMintA,
        seller: seller.publicKey,
      })
      .rpc();

    const offerAccount = await program.account.offer.fetch(offerPda);
    assert.equal(offerAccount.seller.toString(), seller.publicKey.toString());
    assert.equal(offerAccount.tokenAmountA.toNumber(), 10_000_000);
    assert.equal(offerAccount.tokenMintB.toString(), tokenMintB.toString());
    assert.equal(offerAccount.tokenAmountB.toNumber(), 5_000_000);
    assert.equal(offerAccount.allowAlternatives, false);

    // Check vault has the tokens
    const vaultAccount = await getAccount(connection, vaultPda);
    assert.equal(Number(vaultAccount.amount), 10_000_000);
  });

  it("Executes direct swap", async () => {
    const offerId2 = new anchor.BN(2);
    
    const [offerPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("offer"),
        seller.publicKey.toBuffer(),
        offerId2.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    const [vaultPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), offerPda.toBuffer()],
      program.programId
    );

    // Create offer first
    await program.methods
      .initializeOffer(
        offerId2,
        new anchor.BN(5_000_000), // 5 tokenA
        tokenMintB,
        new anchor.BN(2_000_000), // 2 tokenB
        false
      )
      .accounts({
        sellerTokenAccount: sellerTokenAccountA.address,
        tokenMintA: tokenMintA,
        seller: seller.publicKey,
      })
      .rpc();

    // Execute swap
    await program.methods
      .executeSwap()
      .accountsPartial({
        offer: offerPda,
        buyerTokenAccount: buyerTokenAccountB.address,
        sellerTokenAccount: sellerTokenAccountB.address,
        buyerReceiveAccount: buyerTokenAccountA.address,
        buyer: buyer.publicKey,
        seller: seller.publicKey,
      })
      .signers([buyer])
      .rpc();

    // Verify balances
    const buyerAccountA = await getAccount(connection, buyerTokenAccountA.address);
    assert.equal(Number(buyerAccountA.amount), 5_000_000);

    const sellerAccountB = await getAccount(connection, sellerTokenAccountB.address);
    assert.equal(Number(sellerAccountB.amount), 2_000_000);
  });

  it("Submits and accepts proposal", async () => {
    const offerId3 = new anchor.BN(3);
    const proposalId = new anchor.BN(1);
    
    const [offerPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("offer"),
        seller.publicKey.toBuffer(),
        offerId3.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    const [offerVaultPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), offerPda.toBuffer()],
      program.programId
    );

    // Create offer with alternatives enabled
    await program.methods
      .initializeOffer(
        offerId3,
        new anchor.BN(10_000_000), // 10 tokenA
        tokenMintB,
        new anchor.BN(5_000_000), // 5 tokenB
        true // allow alternatives
      )
      .accounts({
        sellerTokenAccount: sellerTokenAccountA.address,
        tokenMintA: tokenMintA,
        seller: seller.publicKey,
      })
      .rpc();

    const [proposalPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("proposal"),
        offerPda.toBuffer(),
        buyer.publicKey.toBuffer(),
        proposalId.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    const [proposalVaultPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), proposalPda.toBuffer()],
      program.programId
    );

    // Submit proposal
    await program.methods
      .submitProposal(
        proposalId,
        new anchor.BN(8_000_000) // 8 tokenB
      )
      .accountsPartial({
        offer: offerPda,
        buyerTokenAccount: buyerTokenAccountB.address,
        proposedMint: tokenMintB,
        buyer: buyer.publicKey,
      })
      .signers([buyer])
      .rpc();

    const proposalAccount = await program.account.proposal.fetch(proposalPda);
    assert.equal(proposalAccount.buyer.toString(), buyer.publicKey.toString());
    assert.equal(proposalAccount.proposedAmount.toNumber(), 8_000_000);

    // Accept proposal
    await program.methods
      .acceptProposal()
      .accountsPartial({
        offer: offerPda,
        proposal: proposalPda,
        sellerReceiveAccount: sellerTokenAccountB.address,
        buyerReceiveAccount: buyerTokenAccountA.address,
        seller: seller.publicKey,
        buyerAccount: buyer.publicKey,
      })
      .rpc();

    // Verify final balances
    const buyerAccountA = await getAccount(connection, buyerTokenAccountA.address);
    const sellerAccountB = await getAccount(connection, sellerTokenAccountB.address);
    
    assert.equal(Number(buyerAccountA.amount), 15_000_000); // 5 + 10
    assert.equal(Number(sellerAccountB.amount), 10_000_000); // 2 + 8
  });
});

