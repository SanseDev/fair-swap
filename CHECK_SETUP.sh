#!/bin/bash

echo "🔍 Fair Swap - Setup Verification"
echo "=================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found"
    echo "   Create a .env file with:"
    echo "   - SUPABASE_URL"
    echo "   - SUPABASE_SERVICE_ROLE_KEY"
    echo "   - PROGRAM_ID"
    echo "   - SOLANA_RPC_URL"
    exit 1
else
    echo "✅ .env file found"
fi

# Check env variables
echo ""
echo "🔐 Environment Variables:"
if grep -q "SUPABASE_URL=" .env; then
    SUPABASE_URL=$(grep "SUPABASE_URL=" .env | cut -d '=' -f2)
    if [ -z "$SUPABASE_URL" ]; then
        echo "   ❌ SUPABASE_URL is empty"
    else
        echo "   ✅ SUPABASE_URL is set"
    fi
else
    echo "   ❌ SUPABASE_URL not found"
fi

if grep -q "SUPABASE_SERVICE_ROLE_KEY=" .env; then
    echo "   ✅ SUPABASE_SERVICE_ROLE_KEY is set"
else
    echo "   ❌ SUPABASE_SERVICE_ROLE_KEY not found"
fi

if grep -q "PROGRAM_ID=" .env; then
    PROGRAM_ID=$(grep "PROGRAM_ID=" .env | cut -d '=' -f2)
    if [ -z "$PROGRAM_ID" ]; then
        echo "   ❌ PROGRAM_ID is empty"
    else
        echo "   ✅ PROGRAM_ID is set: $PROGRAM_ID"
    fi
else
    echo "   ❌ PROGRAM_ID not found"
fi

if grep -q "SOLANA_RPC_URL=" .env; then
    RPC_URL=$(grep "SOLANA_RPC_URL=" .env | cut -d '=' -f2)
    echo "   ✅ SOLANA_RPC_URL is set: $RPC_URL"
else
    echo "   ❌ SOLANA_RPC_URL not found"
fi

# Check Anchor.toml
echo ""
echo "⚓ Anchor Configuration:"
if [ -f Anchor.toml ]; then
    echo "   ✅ Anchor.toml found"
    ANCHOR_PROGRAM_ID=$(grep "fair_swap = " Anchor.toml | cut -d '"' -f2)
    if [ -n "$ANCHOR_PROGRAM_ID" ]; then
        echo "   📋 Anchor Program ID: $ANCHOR_PROGRAM_ID"
        if [ "$PROGRAM_ID" == "$ANCHOR_PROGRAM_ID" ]; then
            echo "   ✅ PROGRAM_ID matches Anchor.toml"
        else
            echo "   ⚠️  PROGRAM_ID in .env doesn't match Anchor.toml"
        fi
    fi
else
    echo "   ❌ Anchor.toml not found"
fi

# Test Supabase connection
echo ""
echo "🔌 Testing Supabase Connection..."
pnpm run db:test

echo ""
echo "=================================="
echo "✨ Next steps:"
echo "   1. Fix any ❌ issues above"
echo "   2. Create an offer on the frontend"
echo "   3. Start the indexer: pnpm index:start"
echo "   4. Watch the logs for transaction processing"
echo ""


