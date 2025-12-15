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
      const accountInfo = await this.connection.getAccountInfo(new PublicKey(offerPda));
      if (!accountInfo || !accountInfo.data) {
        return null;
      }

      // Manual deserialization - Anchor account structure:
      // [8 bytes discriminator][8 bytes offer_id][32 bytes seller][...]
      const data = accountInfo.data;
      
      // Skip 8-byte discriminator
      const offerIdBytes = data.slice(8, 16);
      
      // Read u64 as little-endian
      const offerId = offerIdBytes.readBigUInt64LE(0);
      
      return offerId.toString();
    } catch (error) {
      console.error('Failed to decode offer account:', error);
      return null;
    }
  }

  async processInstruction(
    instruction: ParsedInstruction,
    signature: string,
    slot: number
  ): Promise<void> {
    try {
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
      }
    } catch (error) {
      console.error(`Failed to process ${instruction.type}:`, error);
      throw error;
    }
  }

  private async handleInitializeOffer(
    instruction: ParsedInstruction,
    signature: string,
    slot: number
  ): Promise<void> {
    const { data, accounts } = instruction;
    
    await this.offerRepo.create({
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
    } as Partial<Offer>);

    console.log(`✓ Indexed offer creation: ${data.offer_id || data.offerId}`);
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
    
    // Find the offer
    const offers = await this.offerRepo.findAll();
    const offer = offers.find(o => o.seller === accounts.seller && o.status === 'active');

    if (offer) {
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
      console.log(`✓ Indexed swap execution: ${offer.offer_id}`);
    }
  }

  private async handleSubmitProposal(
    instruction: ParsedInstruction,
    signature: string,
    slot: number
  ): Promise<void> {
    const { data, accounts } = instruction;
    
    // Fetch the offer account to get the actual offer_id
    const offerId = await this.fetchOfferAccount(accounts.offer);
    
    if (!offerId) {
      console.error('Could not fetch offer account for proposal');
      return;
    }

    // Anchor uses snake_case for instruction args
    const proposalId = data.proposal_id;
    const proposedAmount = data.proposed_amount;
    
    if (!proposalId || !proposedAmount) {
      console.error('Missing proposal data:', JSON.stringify(data));
      return;
    }

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

    console.log(`✓ Indexed proposal submission: ${proposalId} for offer ${offerId}`);
  }

  private async handleAcceptProposal(
    instruction: ParsedInstruction,
    signature: string,
    slot: number
  ): Promise<void> {
    const { accounts } = instruction;
    
    // Fetch the offer account to get the actual offer_id
    const offerId = await this.fetchOfferAccount(accounts.offer);
    
    if (!offerId) {
      console.error('Could not fetch offer account for proposal acceptance');
      return;
    }

    // Find the proposal by offer_id
    const proposals = await this.proposalRepo.findByOfferId(offerId);
    const proposal = proposals.find(p => p.buyer === accounts.buyer && p.status === 'pending');

    if (!proposal) {
      console.error(`No pending proposal found for offer ${offerId} from buyer ${accounts.buyer}`);
      return;
    }

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
      
      console.log(`✓ Indexed proposal acceptance: ${proposal.proposal_id} - Offer ${offerId} completed`);
    } else {
      console.error(`Offer ${offerId} not found in database`);
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




