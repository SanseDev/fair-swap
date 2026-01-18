#!/bin/bash

# Start FairSwap in production mode
echo "🚀 Starting FairSwap..."

# Build everything
pnpm build

# Start with PM2 if installed, otherwise use node
if command -v pm2 &> /dev/null; then
    echo "📦 Starting with PM2..."
    pm2 start ecosystem.config.cjs
    pm2 save
else
    echo "📦 Starting with Node..."
    pnpm start
fi


