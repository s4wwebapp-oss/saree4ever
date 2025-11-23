#!/bin/bash

# Script to install GitHub CLI and create repository

echo "Installing GitHub CLI..."

# Try to download and install GitHub CLI
# Method 1: Try direct download (you may need to update the version)
GH_VERSION="2.47.0"
ARCH="amd64"

# Download GitHub CLI
echo "Downloading GitHub CLI..."
curl -L "https://github.com/cli/cli/releases/download/v${GH_VERSION}/gh_${GH_VERSION}_macOS_${ARCH}.tar.gz" -o /tmp/gh.tar.gz

# Check if download was successful
if [ -s /tmp/gh.tar.gz ] && file /tmp/gh.tar.gz | grep -q "gzip"; then
    echo "Extracting GitHub CLI..."
    tar -xzf /tmp/gh.tar.gz -C /tmp
    sudo mv /tmp/gh_${GH_VERSION}_macOS_${ARCH}/bin/gh /usr/local/bin/gh
    echo "GitHub CLI installed successfully!"
else
    echo "Automatic download failed. Please install GitHub CLI manually:"
    echo "Visit: https://cli.github.com/"
    echo "Or run: brew install gh"
    exit 1
fi

# Authenticate with GitHub
echo "Please authenticate with GitHub..."
gh auth login

# Create the repository
echo "Creating GitHub repository..."
gh repo create saree4ever --public --source=. --remote=origin --push

echo "Done! Your repository is now on GitHub."

