import { Connection, PublicKey } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface ParsedInstruction {
  type: 'initialize_offer' | 'cancel_offer' | 'execute_swap' | 'submit_proposal' | 'accept_proposal' | 'withdraw_proposal';
  data: any;
  accounts: Record<string, string>;
}

export class InstructionParser {
  private program: anchor.Program;
  private coder: anchor.BorshInstructionCoder;

  constructor(programId: string, connection: Connection) {
    // Try multiple paths for the IDL file
    const possiblePaths = [
      resolve(process.cwd(), 'target/idl/fair_swap.json'),
      resolve(process.cwd(), 'src/lib/fair_swap_idl.json'),
      resolve(process.cwd(), '../target/idl/fair_swap.json'),
      resolve(process.cwd(), '../../target/idl/fair_swap.json'),
      resolve(__dirname, '../../target/idl/fair_swap.json'),
      resolve(__dirname, '../../../target/idl/fair_swap.json'),
      resolve(__dirname, '../../src/lib/fair_swap_idl.json'),
    ];
    
    let idl: any;
    for (const path of possiblePaths) {
      try {
        idl = JSON.parse(readFileSync(path, 'utf-8'));
        console.log(`✓ Loaded IDL from: ${path}`);
        break;
      } catch (error) {
        continue;
      }
    }
    
    if (!idl) {
      throw new Error('Could not find IDL file. Make sure the program is built.');
    }
    
    const provider = new anchor.AnchorProvider(
      connection,
      {} as any,
      anchor.AnchorProvider.defaultOptions()
    );
    
    this.program = new anchor.Program(idl, provider);
    this.coder = new anchor.BorshInstructionCoder(idl);
  }

  parseInstruction(data: Buffer, accountKeys: string[]): ParsedInstruction | null {
    try {
      const decoded = this.coder.decode(data);
      
      if (!decoded) {
        return null;
      }

      return {
        type: decoded.name as ParsedInstruction['type'],
        data: decoded.data,
        accounts: this.mapAccounts(decoded.name, accountKeys),
      };
    } catch (error) {
      console.error('Failed to parse instruction:', error);
      return null;
    }
  }

  private mapAccounts(instructionName: string, accountKeys: string[]): Record<string, string> {
    const accountsMap: Record<string, string> = {};
    
    // Map based on instruction type
    switch (instructionName) {
      case 'initialize_offer':
        accountsMap.offer = accountKeys[0];
        accountsMap.vault = accountKeys[1];
        accountsMap.sellerTokenAccount = accountKeys[2];
        accountsMap.tokenMintA = accountKeys[3];
        accountsMap.seller = accountKeys[4];
        break;
      
      case 'cancel_offer':
        accountsMap.offer = accountKeys[0];
        accountsMap.vault = accountKeys[1];
        accountsMap.sellerTokenAccount = accountKeys[2];
        accountsMap.seller = accountKeys[3];
        break;
      
      case 'execute_swap':
        accountsMap.offer = accountKeys[0];
        accountsMap.vault = accountKeys[1];
        accountsMap.buyerTokenAccount = accountKeys[2];
        accountsMap.sellerTokenAccount = accountKeys[3];
        accountsMap.buyerReceiveAccount = accountKeys[4];
        accountsMap.buyer = accountKeys[5];
        accountsMap.seller = accountKeys[6];
        break;
      
      case 'submit_proposal':
        accountsMap.offer = accountKeys[0];
        accountsMap.proposal = accountKeys[1];
        accountsMap.proposalVault = accountKeys[2];
        accountsMap.buyerTokenAccount = accountKeys[3];
        accountsMap.proposedMint = accountKeys[4];
        accountsMap.buyer = accountKeys[5];
        break;
      
      case 'accept_proposal':
        accountsMap.offer = accountKeys[0];
        accountsMap.proposal = accountKeys[1];
        accountsMap.offerVault = accountKeys[2];
        accountsMap.proposalVault = accountKeys[3];
        accountsMap.sellerReceiveAccount = accountKeys[4];
        accountsMap.buyerReceiveAccount = accountKeys[5];
        accountsMap.seller = accountKeys[6];
        accountsMap.buyer = accountKeys[7];
        break;
      
      case 'withdraw_proposal':
        accountsMap.proposal = accountKeys[0];
        accountsMap.proposalVault = accountKeys[1];
        accountsMap.buyerTokenAccount = accountKeys[2];
        accountsMap.buyer = accountKeys[3];
        break;
    }
    
    return accountsMap;
  }

  async fetchAccount(address: string): Promise<any> {
    try {
      const pubkey = new PublicKey(address);
      // Fetch raw account info instead of using typed account methods
      const accountInfo = await this.program.provider.connection.getAccountInfo(pubkey);
      return accountInfo;
    } catch (error) {
      return null;
    }
  }
}

