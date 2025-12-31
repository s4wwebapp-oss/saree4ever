#!/bin/bash

# Script to push to a new GitHub repository
# Usage: ./push-to-new-repo.sh YOUR_USERNAME YOUR_REPO_NAME

if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Usage: ./push-to-new-repo.sh YOUR_USERNAME YOUR_REPO_NAME"
    echo "Example: ./push-to-new-repo.sh myusername saree4ever"
    exit 1
fi

USERNAME=$1
REPO_NAME=$2

echo "Setting up new GitHub repository..."
echo "Repository: https://github.com/$USERNAME/$REPO_NAME"
echo ""

# Remove old remote if it exists
echo "Removing old remote..."
git remote remove origin 2>/dev/null || echo "No old remote to remove"

# Add new remote
echo "Adding new remote..."
git remote add origin https://github.com/$USERNAME/$REPO_NAME.git

# Verify remote
echo ""
echo "Verifying remote..."
git remote -v

echo ""
echo "Ready to push! Make sure you've created the repository on GitHub first."
echo ""
read -p "Have you created the repository on GitHub? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Pushing to GitHub..."
    git push -u origin main
    echo ""
    echo "✅ Successfully pushed to https://github.com/$USERNAME/$REPO_NAME"
else
    echo "Please create the repository on GitHub first, then run:"
    echo "  git push -u origin main"
fi

