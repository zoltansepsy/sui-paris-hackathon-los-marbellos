#!/bin/bash

# Test script to debug paths

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/../../../apps/suipatron/.env.local"
ENV_DIR="$(dirname "$ENV_FILE")"
OUTPUT_FILE="$SCRIPT_DIR/publish-output.txt"

echo "🔍 Testing paths..."
echo ""
echo "Script directory: $SCRIPT_DIR"
echo "Env file path:    $ENV_FILE"
echo "Env directory:    $ENV_DIR"
echo "Output file:      $OUTPUT_FILE"
echo ""

echo "📁 Checking directories..."
if [ -d "$ENV_DIR" ]; then
    echo "✓ Env directory exists: $ENV_DIR"
else
    echo "✗ Env directory doesn't exist: $ENV_DIR"
    echo "  Creating it now..."
    mkdir -p "$ENV_DIR"
    if [ -d "$ENV_DIR" ]; then
        echo "✓ Created successfully!"
    else
        echo "✗ Failed to create directory"
    fi
fi
echo ""

echo "📄 Checking env file..."
if [ -f "$ENV_FILE" ]; then
    echo "✓ Env file exists: $ENV_FILE"
    echo ""
    echo "Current contents:"
    cat "$ENV_FILE"
else
    echo "✗ Env file doesn't exist: $ENV_FILE"
    echo "  Creating it now..."
    cat > "$ENV_FILE" << EOF
# SuiPatron Environment Variables
# Test file

NEXT_PUBLIC_PACKAGE_ID=0xtest123
NEXT_PUBLIC_SUI_NETWORK=testnet
EOF
    if [ -f "$ENV_FILE" ]; then
        echo "✓ Created successfully!"
        echo ""
        echo "Contents:"
        cat "$ENV_FILE"
    else
        echo "✗ Failed to create file"
    fi
fi
echo ""

echo "✅ Path test complete!"
