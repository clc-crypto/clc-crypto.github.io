#!/bin/bash

set -e

mkdir clc
cd clc

echo "Installing prerequisites..."
sudo apt install -y curl git build-essential pkg-config libssl-dev

echo "Installing rust..."
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
export PATH="$HOME/.cargo/bin:$PATH"

echo "Installing Node.js..."
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
# Restart shell or source profile:
export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"
# Then install Node
nvm install 18
nvm use 18

echo "Verifying Node.js installation..."
node -v
npm -v

echo "Installing clc-wallet-cli..."
npm install -g clc-wallet-cli

echo "Cloning clc miner 2 from the git repository..."
git clone https://github.com/clc-crypto/clc-miner2

echo "Building clc miner 2"
cd clc-miner2
cargo build --release

cd ..

echo "All CLC tools installed!"

echo "Creating start scripts..."
echo "./clc-miner2/target/release/clc-miner2" > mine.sh
chmod +x mine.sh

echo "Downloading CLC whitepaper..."
curl -o setup.sh https://clc-crypto.github.io/whitepaper.pdf

echo "Downloading setup script..."
curl -o setup.sh https://clc-crypto.github.io/scripts/setup.sh
chmod +x setup.sh
./setup.sh