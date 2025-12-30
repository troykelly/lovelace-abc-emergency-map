#!/usr/bin/env bash
# Post-start command for Lovelace card development
set -e

# Activate the Home Assistant virtual environment
export PATH="/home/vscode/.local/ha-venv/bin:$PATH"

# ============================================================================
# GitHub Token Setup
# Export GITHUB_TOKEN from gh CLI for MCP servers and other tools
# ============================================================================
setup_github_token_sourcing() {
    local rc_file="$1"
    local marker="# >>> github-token-setup >>>"
    local end_marker="# <<< github-token-setup <<<"

    # Skip if file doesn't exist
    [ ! -f "$rc_file" ] && return 0

    # Check if already configured (idempotent)
    if grep -q "$marker" "$rc_file" 2>/dev/null; then
        return 0
    fi

    # Append the token sourcing block
    cat >> "$rc_file" << 'GHTOKEN'

# >>> github-token-setup >>>
# Export GITHUB_TOKEN from gh CLI for MCP servers and other tools
if command -v gh &>/dev/null && gh auth status &>/dev/null; then
    export GITHUB_TOKEN="$(gh auth token 2>/dev/null)"
fi
# <<< github-token-setup <<<
GHTOKEN

    echo "GitHub token sourcing added to $rc_file"
}

# Set up token sourcing in shell rc files
setup_github_token_sourcing "/home/vscode/.zshrc"
setup_github_token_sourcing "/home/vscode/.bashrc"

# Also export for the current session (postStartCommand runs in its own shell,
# but this ensures any child processes have access)
if command -v gh &>/dev/null && gh auth status &>/dev/null; then
    export GITHUB_TOKEN="$(gh auth token 2>/dev/null)"
    echo "GITHUB_TOKEN exported for current session"
fi

# Ensure directories exist
mkdir -p /workspaces/lovelace-abc-emergency-map/config/www
mkdir -p /workspaces/lovelace-abc-emergency-map/config/custom_components

# Ensure ABC Emergency integration is linked
if [ -d "/tmp/abcemergency/custom_components/abcemergency" ]; then
    ln -sf /tmp/abcemergency/custom_components/abcemergency /workspaces/lovelace-abc-emergency-map/config/custom_components/ 2>/dev/null || true
fi

# Update Node.js dependencies if needed
if [ -f "package.json" ]; then
    pnpm install 2>/dev/null || true
fi

# Update Python dependencies if needed
if [ -f "pyproject.toml" ]; then
    uv pip install -e ".[dev]" 2>/dev/null || uv pip install -e . 2>/dev/null || true
fi

# Deploy latest card build if it exists
if [ -f "dist/abc-emergency-map-card.js" ]; then
    cp dist/abc-emergency-map-card.js config/www/
fi

echo ""
echo "Dev container started."
echo "  ha     - Start Home Assistant"
echo "  dev    - Build card with watch mode"
echo "  deploy - Build and deploy card to HA"
