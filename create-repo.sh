#!/bin/bash

# Script to create GitHub repository after GitHub CLI is installed

echo "Checking for GitHub CLI..."
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed."
    echo "Please install it first using one of the methods in QUICK_SETUP.md"
    exit 1
fi

echo "✅ GitHub CLI found!"

# Check if already authenticated
if ! gh auth status &> /dev/null; then
    echo "🔐 Authenticating with GitHub..."
    echo "This will open your browser for authentication."
    gh auth login
else
    echo "✅ Already authenticated with GitHub"
fi

# Create the repository
echo "📦 Creating GitHub repository 'saree4ever'..."
gh repo create saree4ever --public --source=. --remote=origin --push

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Success! Your repository has been created and pushed to GitHub!"
    echo "🌐 View it at: https://github.com/$(gh api user --jq .login)/saree4ever"
else
    echo "❌ Failed to create repository. Please check the error above."
    exit 1
fi

