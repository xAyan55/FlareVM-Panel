#!/bin/bash

# FlareVM Panel Auto-Installer
# For Ubuntu/Debian

set -e

echo "------------------------------------------------"
echo "   FlareVM Panel - Automated Installer"
echo "------------------------------------------------"

# 1. Update system
echo "[1/6] Updating system..."
sudo apt-get update && sudo apt-get upgrade -y

# 2. Install dependencies
echo "[2/6] Installing Node.js, LXD, and Git..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs lxd git sqlite3 build-essential

# 3. Initialize LXD
echo "[3/6] Initializing LXD..."
sudo lxd init --auto

# 4. Clone and Install Backend
echo "[4/6] Setting up Backend..."
# Assuming we are in the cloned repo or cloning it now
# For the purpose of this script, we'll assume we're in the right place
cd server
npm install
cp .env.example .env || true
npx prisma generate
npx prisma db push --accept-data-loss

# 5. Build Frontend
echo "[5/6] Setting up Frontend..."
cd ../client
npm install
npm run build

# 6. Finalize
echo "[6/6] Finalizing installation..."
echo ""
echo "Installation complete!"
echo "To start the panel, run: cd server && npm start"
echo "Access the panel at: http://YOUR_SERVER_IP:5173 (Frontend) and :5000 (API)"
echo "Default Credentials: admin@flarevm.com / admin123"
echo "------------------------------------------------"
