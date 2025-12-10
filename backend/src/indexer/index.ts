import { FairSwapIndexer } from './indexer.js';

const indexer = new FairSwapIndexer();

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nReceived SIGINT, shutting down gracefully...');
  await indexer.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nReceived SIGTERM, shutting down gracefully...');
  await indexer.stop();
  process.exit(0);
});

// Start the indexer
indexer.start().catch((error) => {
  console.error('Fatal error starting indexer:', error);
  process.exit(1);
});




