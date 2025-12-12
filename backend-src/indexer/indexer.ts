import { Connection, PublicKey } from '@solana/web3.js';
import { InstructionParser } from './parser.js';
import { TransactionProcessor } from './processor.js';
import { IndexerStateRepository } from '../repositories/index.js';
import { env } from '../config/env.js';

export class FairSwapIndexer {
  private connection: Connection;
  private parser: InstructionParser;
  private processor: TransactionProcessor;
  private stateRepo: IndexerStateRepository;
  private programId: PublicKey;
  private isRunning: boolean = false;
  private pollInterval: number = 2000; // 2 seconds

  constructor() {
    this.connection = new Connection(env.solana.rpcUrl, 'confirmed');
    this.parser = new InstructionParser(env.solana.programId, this.connection);
    this.processor = new TransactionProcessor();
    this.stateRepo = new IndexerStateRepository();
    this.programId = new PublicKey(env.solana.programId);
  }

  async start(): Promise<void> {
    console.log('🚀 Starting FairSwap Indexer...');
    console.log(`   Program ID: ${env.solana.programId}`);
    console.log(`   RPC URL: ${env.solana.rpcUrl}`);
    
    this.isRunning = true;
    
    // Initial sync from last processed slot
    const lastProcessedSlot = await this.stateRepo.getLastProcessedSlot();
    console.log(`   Last processed slot: ${lastProcessedSlot}`);
    
    // Start polling loop
    await this.poll();
  }

  async stop(): Promise<void> {
    console.log('🛑 Stopping FairSwap Indexer...');
    this.isRunning = false;
  }

  private async poll(): Promise<void> {
    while (this.isRunning) {
      try {
        await this.processNewTransactions();
      } catch (error) {
        console.error('Error in polling loop:', error);
      }
      
      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, this.pollInterval));
    }
  }

  private async processNewTransactions(): Promise<void> {
    const lastProcessedSlot = await this.stateRepo.getLastProcessedSlot();
    const currentSlot = await this.connection.getSlot();

    if (currentSlot <= lastProcessedSlot) {
      return; // No new slots to process
    }

    // Get signatures for the program
    const signatures = await this.connection.getSignaturesForAddress(
      this.programId,
      {
        limit: 100,
        before: undefined,
      }
    );

    // Filter signatures that are newer than last processed slot
    const newSignatures = signatures.filter(sig => sig.slot > lastProcessedSlot);

    if (newSignatures.length === 0) {
      // Update to current slot even if no transactions
      await this.stateRepo.updateLastProcessedSlot(currentSlot);
      return;
    }

    console.log(`📥 Processing ${newSignatures.length} new transactions...`);

    // Process each transaction
    for (const sigInfo of newSignatures.reverse()) {
      try {
        await this.processTransaction(sigInfo.signature, sigInfo.slot);
      } catch (error) {
        console.error(`Failed to process transaction ${sigInfo.signature}:`, error);
      }
    }

    // Update last processed slot
    const maxSlot = Math.max(...newSignatures.map(s => s.slot));
    await this.stateRepo.updateLastProcessedSlot(maxSlot);
    console.log(`✓ Processed up to slot: ${maxSlot}`);
  }

  private async processTransaction(signature: string, slot: number): Promise<void> {
    // Use getTransaction instead of getParsedTransaction to get raw instruction data
    const tx = await this.connection.getTransaction(signature, {
      maxSupportedTransactionVersion: 0,
      commitment: 'confirmed',
    });

    if (!tx || !tx.meta || tx.meta.err) {
      return; // Skip failed transactions
    }

    // Get account keys using the proper method
    const message = tx.transaction.message;
    const accountKeys = message.getAccountKeys ? 
                       message.getAccountKeys().staticAccountKeys : 
                       (message as any).accountKeys;

    if (!accountKeys) {
      console.error('Could not extract account keys from transaction');
      return;
    }

    // Find instructions for our program
    const instructions = message.compiledInstructions.filter(
      (ix) => {
        const programIdIndex = ix.programIdIndex;
        const programId = accountKeys[programIdIndex].toBase58();
        return programId === this.programId.toString();
      }
    );

    for (const instruction of instructions) {
      try {
        // instruction.data is a Uint8Array, convert to Buffer
        const data = Buffer.from(instruction.data);
        
        // Map account indices to actual addresses
        const instructionAccountKeys = instruction.accountKeyIndexes.map(
          (index) => accountKeys[index].toBase58()
        );

        const parsed = this.parser.parseInstruction(data, instructionAccountKeys);
        
        if (parsed) {
          await this.processor.processInstruction(parsed, signature, slot);
        }
      } catch (error) {
        console.error('Failed to process instruction:', error);
      }
    }
  }
}


