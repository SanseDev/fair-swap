#!/bin/bash

# Stop FairSwap services
echo "🛑 Stopping FairSwap..."

if command -v pm2 &> /dev/null; then
    pm2 stop fair-swap-backend fair-swap-web
    pm2 delete fair-swap-backend fair-swap-web
else
    pkill -f "node dist/index"
    pkill -f "next start"
fi

echo "✅ Stopped"


