#!/usr/bin/env bash
# Post-create command for Lovelace card development with Home Assistant testing
set -e

echo "=== ABC Emergency Map Card - Dev Container Setup ==="

# Activate the Home Assistant virtual environment
export PATH="/home/vscode/.local/ha-venv/bin:$PATH"

# Create config directory structure
mkdir -p /workspaces/lovelace-abc-emergency-map/config/www
mkdir -p /workspaces/lovelace-abc-emergency-map/config/custom_components

# Install Node.js project dependencies
if [ -f "package.json" ]; then
    echo "Installing Node.js dependencies with pnpm..."
    pnpm install
fi

# Install Home Assistant component dependencies
echo "Installing Home Assistant component dependencies..."
pip install ha-ffmpeg 2>/dev/null || true

# Clone and link ABC Emergency integration for testing
if [ ! -d "/workspaces/lovelace-abc-emergency-map/config/custom_components/abcemergency" ]; then
    echo "Cloning ABC Emergency integration for testing..."
    git clone --depth 1 https://github.com/troykelly/homeassistant-abcemergency.git /tmp/abcemergency 2>/dev/null || true
    if [ -d "/tmp/abcemergency/custom_components/abcemergency" ]; then
        ln -sf /tmp/abcemergency/custom_components/abcemergency /workspaces/lovelace-abc-emergency-map/config/custom_components/
        echo "ABC Emergency integration linked successfully"
    fi
fi

# Create Home Assistant configuration if it doesn't exist
if [ ! -f "/workspaces/lovelace-abc-emergency-map/config/configuration.yaml" ]; then
    echo "Creating default Home Assistant configuration..."
    cat > /workspaces/lovelace-abc-emergency-map/config/configuration.yaml << 'EOF'
# Home Assistant Development Configuration
# For testing ABC Emergency Map Card

homeassistant:
  name: Lovelace Card Dev
  unit_system: metric
  time_zone: Australia/Sydney
  latitude: -33.8688
  longitude: 151.2093

# Enable default config components
default_config:

# Enable debug logging
logger:
  default: info
  logs:
    custom_components.abcemergency: debug
    homeassistant.components.geo_location: debug

# Frontend configuration for custom card testing
frontend:
  extra_module_url:
    - /local/abc-emergency-map-card.js

# Lovelace in YAML mode for easier testing
lovelace:
  mode: yaml
  resources:
    - url: /local/abc-emergency-map-card.js
      type: module
EOF
fi

# Create a test Lovelace dashboard
if [ ! -f "/workspaces/lovelace-abc-emergency-map/config/ui-lovelace.yaml" ]; then
    echo "Creating test Lovelace dashboard..."
    cat > /workspaces/lovelace-abc-emergency-map/config/ui-lovelace.yaml << 'EOF'
# Test Dashboard for ABC Emergency Map Card

title: ABC Emergency Map Test
views:
  - title: Emergency Map
    path: emergency-map
    cards:
      - type: custom:abc-emergency-map-card
        title: Emergency Incidents
        default_zoom: 6
        hours_to_show: 24
        show_warning_levels: true

      - type: markdown
        title: Development Notes
        content: |
          ## Testing the ABC Emergency Map Card

          1. Build the card: `pnpm run build`
          2. Deploy to HA: `deploy` (alias)
          3. Refresh browser to see changes

          The card should display emergency incidents from the
          ABC Emergency integration as polygons on a Leaflet map.
EOF
fi

# Build the card initially
if [ -f "package.json" ]; then
    echo "Building Lovelace card..."
    pnpm run build 2>/dev/null || true

    # Copy built card to HA www directory
    if [ -f "dist/abc-emergency-map-card.js" ]; then
        cp dist/abc-emergency-map-card.js config/www/
        echo "Card deployed to config/www/"
    fi
fi

# Install Claude CLI globally
echo "Installing Claude CLI..."
curl -fsSL https://raw.githubusercontent.com/troykelly/claude-skills/main/install.sh | bash

# Verify tools
echo ""
echo "=== Verifying installed tools ==="
echo "Python: $(python --version 2>&1 || echo 'not found')"
echo "Home Assistant: $(python -c 'import homeassistant; print(homeassistant.__version__)' 2>&1 || echo 'not found')"
echo "Node: $(node --version 2>&1 || echo 'not found')"
echo "pnpm: $(pnpm --version 2>&1 || echo 'not found')"
echo "TypeScript: $(pnpm exec tsc --version 2>&1 || echo 'not found')"
echo "uv: $(uv --version 2>&1 || echo 'not found')"
echo "claude: $(claude --version 2>&1 || echo 'not found')"

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Commands:"
echo "  ha       - Start Home Assistant (http://localhost:8123)"
echo "  build    - Build the Lovelace card"
echo "  dev      - Build with watch mode"
echo "  deploy   - Build and copy to HA www folder"
echo "  halog    - Tail Home Assistant logs"
echo ""
echo "Workflow:"
echo "  1. Start HA: ha"
echo "  2. Configure ABC Emergency integration in HA UI"
echo "  3. Run: dev (in another terminal)"
echo "  4. Edit card code, deploy, refresh browser"
