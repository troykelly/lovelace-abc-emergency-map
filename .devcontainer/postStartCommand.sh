#!/usr/bin/env bash
# Post-start command
set -e

# Ensure dependencies are up to date
if [ -f "package.json" ]; then
    pnpm install 2>/dev/null || true
fi

echo "Dev container started. Use 'pnpm run dev' to start development."
