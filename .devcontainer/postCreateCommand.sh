#!/usr/bin/env bash
# Post-create command for Lovelace card development
set -e

echo "=== ABC Emergency Map Card - Dev Container Setup ==="

# Install project dependencies
if [ -f "package.json" ]; then
    echo "Installing dependencies with pnpm..."
    pnpm install
fi

# Verify tools
echo ""
echo "=== Verifying installed tools ==="
echo "Node: $(node --version 2>&1 || echo 'not found')"
echo "pnpm: $(pnpm --version 2>&1 || echo 'not found')"
echo "TypeScript: $(pnpm exec tsc --version 2>&1 || echo 'not found')"
echo "claude: $(claude --version 2>&1 || echo 'not found')"

echo ""
echo "=== Setup Complete ==="
echo "To build: pnpm run build"
echo "To develop with watch: pnpm run dev"
