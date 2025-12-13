import { Connection } from '@solana/web3.js';
export interface ParsedInstruction {
    type: 'initialize_offer' | 'cancel_offer' | 'execute_swap' | 'submit_proposal' | 'accept_proposal' | 'withdraw_proposal';
    data: any;
    accounts: Record<string, string>;
}
export declare class InstructionParser {
    private program;
    private coder;
    constructor(programId: string, connection: Connection);
    parseInstruction(data: Buffer, accountKeys: string[]): ParsedInstruction | null;
    private mapAccounts;
    fetchAccount(address: string): Promise<any>;
}
//# sourceMappingURL=parser.d.ts.map