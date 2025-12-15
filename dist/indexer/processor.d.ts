import { ParsedInstruction, InstructionParser } from './parser.js';
import { Connection } from '@solana/web3.js';
export declare class TransactionProcessor {
    private offerRepo;
    private proposalRepo;
    private swapRepo;
    private connection;
    private parser;
    constructor(connection: Connection, parser: InstructionParser);
    private fetchOfferAccount;
    processInstruction(instruction: ParsedInstruction, signature: string, slot: number): Promise<void>;
    private handleInitializeOffer;
    private handleCancelOffer;
    private handleExecuteSwap;
    private handleSubmitProposal;
    private handleAcceptProposal;
    private handleWithdrawProposal;
}
//# sourceMappingURL=processor.d.ts.map