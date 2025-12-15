import { ParsedInstruction, InstructionParser } from './parser.js';
import { 
  OfferRepository, 
  ProposalRepository, 
  SwapRepository 
} from '../repositories/index.js';
import { Offer, Proposal } from '../types/index.js';
import { Connection, PublicKey } from '@solana/web3.js';

export class TransactionProcessor {
  private offerRepo: OfferRepository;
  private proposalRepo: ProposalRepository;
  private swapRepo: SwapRepository;
  private connection: Connection;
  private parser: InstructionParser;

  constructor(connection: Connection, parser: InstructionParser) {
    this.offerRepo = new OfferRepository();
    this.proposalRepo = new ProposalRepository();
    this.swapRepo = new SwapRepository();
    this.connection = connection;
    this.parser = parser;
  }

  private async fetchOfferAccount(offerPda: string): Promise<string | null> {
    try {
      // Try to get from blockchain first
      const accountInfo = await this.connection.getAccountInfo(new PublicKey(offerPda));
      if (accountInfo && accountInfo.data) {
        // Manual deserialization - Anchor account structure:
        // [8 bytes discriminator][8 bytes offer_id][32 bytes seller][...]
        const data = accountInfo.data;
        
        // Skip 8-byte discriminator
        const offerIdBytes = data.slice(8, 16);
        
        // Read u64 as little-endian
        const offerId = offerIdBytes.readBigUInt64LE(0);
        
        return offerId.toString();
      }

      // If account doesn't exist on chain (closed), try to find in DB
      // This happens when offers are completed/cancelled
      console.log('   ℹ️  Offer account not found on-chain, searching in DB...');
      const offers = await this.offerRepo.findAll(1000); // Get more offers
      
      // Try to match by PDA address if we stored it, or return null
      // For now, we can't match without the PDA, so return null
      console.log('   ⚠️  Cannot match offer from PDA alone, skipping proposal');
      return null;
      
    } catch (error) {
      console.error('   ❌ Failed to fetch/decode offer account:', error);
      return null;
    }
  }

  async processInstruction(
    instruction: ParsedInstruction,
    signature: string,
    slot: number
  ): Promise<void> {
    try {
      console.log(`📝 Processing instruction: ${instruction.type} (slot: ${slot}, sig: ${signature.slice(0, 8)}...)`);
      
      switch (instruction.type) {
        case 'initialize_offer':
          await this.handleInitializeOffer(instruction, signature, slot);
          break;
        
        case 'cancel_offer':
          await this.handleCancelOffer(instruction, signature, slot);
          break;
        
        case 'execute_swap':
          await this.handleExecuteSwap(instruction, signature, slot);
          break;
        
        case 'submit_proposal':
          await this.handleSubmitProposal(instruction, signature, slot);
          break;
        
        case 'accept_proposal':
          await this.handleAcceptProposal(instruction, signature, slot);
          break;
        
        case 'withdraw_proposal':
          await this.handleWithdrawProposal(instruction, signature, slot);
          break;
        
        default:
          console.log(`⚠️ Unknown instruction type: ${instruction.type}`);
      }
    } catch (error) {
      console.error(`❌ Failed to process ${instruction.type}:`, error);
      if (error instanceof Error) {
        console.error(`   Error message: ${error.message}`);
        console.error(`   Stack: ${error.stack}`);
      }
      throw error;
    }
  }

  private async handleInitializeOffer(
    instruction: ParsedInstruction,
    signature: string,
    slot: number
  ): Promise<void> {
    const { data, accounts } = instruction;
    
    const offerData = {
      offer_id: data.offer_id?.toString() || data.offerId?.toString(),
      seller: accounts.seller,
      token_mint_a: accounts.tokenMintA || accounts.token_mint_a,
      token_amount_a: (data.token_amount_a || data.tokenAmountA)?.toString(),
      token_mint_b: (data.token_mint_b || data.tokenMintB)?.toString(),
      token_amount_b: (data.token_amount_b || data.tokenAmountB)?.toString(),
      allow_alternatives: data.allow_alternatives ?? data.allowAlternatives,
      status: 'active',
      signature,
      slot,
    } as Partial<Offer>;

    console.log(`   💾 Saving offer to DB:`, {
      offer_id: offerData.offer_id,
      seller: offerData.seller?.slice(0, 8),
      signature: signature.slice(0, 8)
    });

    try {
      const created = await this.offerRepo.create(offerData);
      console.log(`   ✅ Indexed offer creation: ${data.offer_id || data.offerId} (DB ID: ${created.id})`);
    } catch (error) {
      console.error(`   ❌ Failed to save offer to DB:`, error);
      throw error;
    }
  }

  private async handleCancelOffer(
    instruction: ParsedInstruction,
    signature: string,
    slot: number
  ): Promise<void> {
    const { accounts } = instruction;
    
    const offer = await this.offerRepo.findBySellerAndOfferId(
      accounts.seller,
      accounts.offer
    );

    if (offer) {
      await this.offerRepo.updateStatus(offer.id, 'cancelled');
      console.log(`✓ Indexed offer cancellation: ${offer.offer_id}`);
    }
  }

  private async handleExecuteSwap(
    instruction: ParsedInstruction,
    signature: string,
    slot: number
  ): Promise<void> {
    const { accounts } = instruction;
    
    console.log(`   🔍 Looking for active offer from seller: ${accounts.seller?.slice(0, 8)}...`);
    
    // Find the offer
    const offers = await this.offerRepo.findAll();
    const offer = offers.find(o => o.seller === accounts.seller && o.status === 'active');

    if (offer) {
      console.log(`   💾 Saving swap to DB for offer: ${offer.offer_id}`);
      
      await this.swapRepo.create({
        offer_id: offer.offer_id,
        proposal_id: null,
        buyer: accounts.buyer,
        seller: accounts.seller,
        token_a_mint: offer.token_mint_a,
        token_a_amount: offer.token_amount_a,
        token_b_mint: offer.token_mint_b,
        token_b_amount: offer.token_amount_b,
        signature,
        slot,
      });

      await this.offerRepo.updateStatus(offer.id, 'completed');
      console.log(`   ✅ Indexed swap execution: ${offer.offer_id}`);
    } else {
      console.log(`   ⚠️ No active offer found for seller: ${accounts.seller}`);
    }
  }

  private async handleSubmitProposal(
    instruction: ParsedInstruction,
    signature: string,
    slot: number
  ): Promise<void> {
    const { data, accounts } = instruction;
    
    console.log(`   🔍 Looking for offer in DB by PDA: ${accounts.offer.slice(0, 8)}...`);
    
    // Try to fetch the offer account from blockchain
    let offerId = await this.fetchOfferAccount(accounts.offer);
    
    // If not found on-chain, try to find in DB by seller
    if (!offerId) {
      console.log('   🔍 Trying to find active offer from seller in DB...');
      const offers = await this.offerRepo.findAll(1000);
      
      // We don't have a direct mapping, so we'll skip this proposal
      // In a production system, you'd want to store the PDA address with each offer
      console.log('   ⚠️  Skipping proposal - offer account not available (likely closed)');
      return;
    }

    // Anchor uses snake_case for instruction args
    const proposalId = data.proposal_id;
    const proposedAmount = data.proposed_amount;
    
    if (!proposalId || !proposedAmount) {
      console.error('   ❌ Missing proposal data:', JSON.stringify(data));
      return;
    }

    console.log(`   💾 Saving proposal to DB: proposal_id=${proposalId}, offer_id=${offerId}`);

    await this.proposalRepo.create({
      proposal_id: proposalId.toString(),
      buyer: accounts.buyer,
      offer_id: offerId,
      proposed_mint: accounts.proposedMint,
      proposed_amount: proposedAmount.toString(),
      status: 'pending',
      signature,
      slot,
    } as Partial<Proposal>);

    console.log(`   ✅ Indexed proposal submission: ${proposalId} for offer ${offerId}`);
  }

  private async handleAcceptProposal(
    instruction: ParsedInstruction,
    signature: string,
    slot: number
  ): Promise<void> {
    const { accounts } = instruction;
    
    console.log(`   🔍 Looking for offer for proposal acceptance...`);
    
    // Try to fetch the offer account from blockchain
    let offerId = await this.fetchOfferAccount(accounts.offer);
    
    if (!offerId) {
      console.log('   ⚠️  Skipping proposal acceptance - offer account not available (likely closed)');
      return;
    }

    console.log(`   🔍 Looking for pending proposal for offer ${offerId}`);
    
    // Find the proposal by offer_id
    const proposals = await this.proposalRepo.findByOfferId(offerId);
    const proposal = proposals.find(p => p.buyer === accounts.buyer && p.status === 'pending');

    if (!proposal) {
      console.error(`   ❌ No pending proposal found for offer ${offerId} from buyer ${accounts.buyer}`);
      return;
    }

    console.log(`   💾 Updating proposal status and creating swap record...`);
    
    // Update proposal status to accepted
    await this.proposalRepo.updateStatus(proposal.id, 'accepted');

    // Find the offer by numeric offer_id
    const offers = await this.offerRepo.findAll();
    const offer = offers.find(o => o.offer_id === offerId);

    if (offer) {
      // Create swap record
      await this.swapRepo.create({
        offer_id: offer.offer_id,
        proposal_id: proposal.proposal_id,
        buyer: accounts.buyer,
        seller: accounts.seller,
        token_a_mint: offer.token_mint_a,
        token_a_amount: offer.token_amount_a,
        token_b_mint: proposal.proposed_mint,
        token_b_amount: proposal.proposed_amount,
        signature,
        slot,
      });

      // Mark offer as completed
      await this.offerRepo.updateStatus(offer.id, 'completed');
      
      // Mark all other pending proposals for this offer as withdrawn
      const otherProposals = proposals.filter(p => p.id !== proposal.id && p.status === 'pending');
      for (const otherProposal of otherProposals) {
        await this.proposalRepo.updateStatus(otherProposal.id, 'withdrawn');
      }
      
      console.log(`   ✅ Indexed proposal acceptance: ${proposal.proposal_id} - Offer ${offerId} completed`);
    } else {
      console.error(`   ❌ Offer ${offerId} not found in database`);
    }
  }

  private async handleWithdrawProposal(
    instruction: ParsedInstruction,
    signature: string,
    slot: number
  ): Promise<void> {
    const { accounts } = instruction;
    
    const proposals = await this.proposalRepo.findByBuyer(accounts.buyer);
    const proposal = proposals.find(p => p.status === 'pending');

    if (proposal) {
      await this.proposalRepo.updateStatus(proposal.id, 'withdrawn');
      console.log(`✓ Indexed proposal withdrawal: ${proposal.proposal_id}`);
    }
  }
}




