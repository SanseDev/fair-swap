import { OfferRepository, ProposalRepository, SwapRepository } from '../repositories/index.js';
export class TransactionProcessor {
    offerRepo;
    proposalRepo;
    swapRepo;
    constructor() {
        this.offerRepo = new OfferRepository();
        this.proposalRepo = new ProposalRepository();
        this.swapRepo = new SwapRepository();
    }
    async processInstruction(instruction, signature, slot) {
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
        }
        catch (error) {
            console.error(`Failed to process ${instruction.type}:`, error);
            throw error;
        }
    }
    async handleInitializeOffer(instruction, signature, slot) {
        const { data, accounts } = instruction;
        await this.offerRepo.create({
            offer_id: data.offerId.toString(),
            seller: accounts.seller,
            token_mint_a: accounts.tokenMintA,
            token_amount_a: data.tokenAmountA.toString(),
            token_mint_b: data.tokenMintB.toString(),
            token_amount_b: data.tokenAmountB.toString(),
            allow_alternatives: data.allowAlternatives,
            status: 'active',
            signature,
            slot,
        });
        console.log(`✓ Indexed offer creation: ${data.offerId}`);
    }
    async handleCancelOffer(instruction, signature, slot) {
        const { accounts } = instruction;
        const offer = await this.offerRepo.findBySellerAndOfferId(accounts.seller, accounts.offer);
        if (offer) {
            await this.offerRepo.updateStatus(offer.id, 'cancelled');
            console.log(`✓ Indexed offer cancellation: ${offer.offer_id}`);
        }
    }
    async handleExecuteSwap(instruction, signature, slot) {
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
    async handleSubmitProposal(instruction, signature, slot) {
        const { data, accounts } = instruction;
        await this.proposalRepo.create({
            proposal_id: data.proposalId.toString(),
            buyer: accounts.buyer,
            offer_id: accounts.offer,
            proposed_mint: accounts.proposedMint,
            proposed_amount: data.proposedAmount.toString(),
            status: 'pending',
            signature,
            slot,
        });
        console.log(`✓ Indexed proposal submission: ${data.proposalId}`);
    }
    async handleAcceptProposal(instruction, signature, slot) {
        const { accounts } = instruction;
        const proposals = await this.proposalRepo.findByBuyer(accounts.buyer);
        const proposal = proposals.find(p => p.offer_id === accounts.offer && p.status === 'pending');
        if (proposal) {
            await this.proposalRepo.updateStatus(proposal.id, 'accepted');
            // Create swap record
            const offer = await this.offerRepo.findBySellerAndOfferId(accounts.seller, accounts.offer);
            if (offer) {
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
                await this.offerRepo.updateStatus(offer.id, 'completed');
                console.log(`✓ Indexed proposal acceptance: ${proposal.proposal_id}`);
            }
        }
    }
    async handleWithdrawProposal(instruction, signature, slot) {
        const { accounts } = instruction;
        const proposals = await this.proposalRepo.findByBuyer(accounts.buyer);
        const proposal = proposals.find(p => p.status === 'pending');
        if (proposal) {
            await this.proposalRepo.updateStatus(proposal.id, 'withdrawn');
            console.log(`✓ Indexed proposal withdrawal: ${proposal.proposal_id}`);
        }
    }
}
//# sourceMappingURL=processor.js.map