import { startServer } from './api/server.js';
import { FairSwapIndexer } from './indexer/indexer.js';

const indexer = new FairSwapIndexer();

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await indexer.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await indexer.stop();
  process.exit(0);
});

// Start both server and indexer
Promise.all([
  startServer(),
  indexer.start()
]).catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});