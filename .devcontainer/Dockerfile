# Lovelace Card Development Container
# Node.js LTS + Python/Home Assistant for testing

FROM mcr.microsoft.com/devcontainers/python:3.14

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    SHELL=/usr/bin/zsh

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    # Build essentials
    build-essential \
    cmake \
    autoconf \
    pkg-config \
    # Media processing (required for HA media components)
    ffmpeg \
    libturbojpeg0 \
    libturbojpeg0-dev \
    # FFmpeg development libraries
    libavformat-dev \
    libavcodec-dev \
    libavdevice-dev \
    libavutil-dev \
    libavfilter-dev \
    libswscale-dev \
    libswresample-dev \
    # Network capture
    libpcap-dev \
    # Bluetooth support
    libbluetooth-dev \
    # Additional tools
    curl \
    wget \
    jq \
    # Shell enhancements
    zsh \
    fzf \
    # Clean up
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Create directories
RUN mkdir -p /workspaces/lovelace-abc-emergency-map/config/www

# Switch to vscode user
USER vscode

# Create virtual environment for Home Assistant
ENV HA_VENV=/home/vscode/.local/ha-venv
RUN python -m venv ${HA_VENV}

# Install Home Assistant and development dependencies
RUN ${HA_VENV}/bin/pip install --upgrade pip setuptools wheel && \
    ${HA_VENV}/bin/pip install \
    homeassistant \
    pytest \
    pytest-asyncio \
    pytest-cov \
    pytest-homeassistant-custom-component \
    ruff \
    mypy \
    pre-commit

# Set up Oh My Zsh
RUN sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended || true

# Add useful aliases and PATH configuration
RUN echo '\n# Home Assistant Development\n\
export PATH="${HA_VENV}/bin:$PATH"\n\
alias ha="hass -c /workspaces/lovelace-abc-emergency-map/config"\n\
alias halog="tail -f /workspaces/lovelace-abc-emergency-map/config/home-assistant.log"\n\
\n# Lovelace Card Development\n\
alias build="pnpm run build"\n\
alias dev="pnpm run dev"\n\
alias lint="pnpm run lint"\n\
alias deploy="pnpm run build && cp dist/abc-emergency-map-card.js config/www/"\n\
\n# >>> github-token-setup >>>\n\
# Export GITHUB_TOKEN from gh CLI for MCP servers and other tools\n\
if command -v gh &>/dev/null && gh auth status &>/dev/null; then\n\
    export GITHUB_TOKEN="$(gh auth token 2>/dev/null)"\n\
fi\n\
# <<< github-token-setup <<<\n\
' >> /home/vscode/.zshrc

# Add to bashrc as fallback
RUN echo '\n# Home Assistant Development\n\
export PATH="${HA_VENV}/bin:$PATH"\n\
alias ha="hass -c /workspaces/lovelace-abc-emergency-map/config"\n\
alias halog="tail -f /workspaces/lovelace-abc-emergency-map/config/home-assistant.log"\n\
alias build="pnpm run build"\n\
alias dev="pnpm run dev"\n\
alias deploy="pnpm run build && cp dist/abc-emergency-map-card.js config/www/"\n\
\n# >>> github-token-setup >>>\n\
# Export GITHUB_TOKEN from gh CLI for MCP servers and other tools\n\
if command -v gh &>/dev/null && gh auth status &>/dev/null; then\n\
    export GITHUB_TOKEN="$(gh auth token 2>/dev/null)"\n\
fi\n\
# <<< github-token-setup <<<\n\
' >> /home/vscode/.bashrc

WORKDIR /workspaces

CMD ["sleep", "infinity"]
