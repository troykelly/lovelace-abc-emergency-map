# Lovelace Card Development Container
# Node.js LTS for TypeScript/Rollup builds

FROM mcr.microsoft.com/devcontainers/typescript-node:22

# Set environment variables
ENV SHELL=/usr/bin/zsh

# Install additional tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    zsh \
    fzf \
    jq \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Switch to vscode user
USER vscode

# Set up Oh My Zsh
RUN sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended || true

# Add useful aliases
RUN echo '\n# Lovelace Card Development\n\
alias build="pnpm run build"\n\
alias dev="pnpm run dev"\n\
alias lint="pnpm run lint"\n\
alias test="pnpm run test"\n\
' >> /home/vscode/.zshrc

WORKDIR /workspaces

CMD ["sleep", "infinity"]
