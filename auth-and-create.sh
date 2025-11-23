#!/bin/bash

# Add GitHub CLI to PATH
export PATH="$HOME/bin:$PATH"

echo "🔐 Authenticating with GitHub..."
echo ""
echo "This will open your browser. Please complete the authentication."
echo ""

# Start authentication in background and capture the code
gh auth login --web 2>&1 | tee /tmp/gh-auth.log &
AUTH_PID=$!

# Wait a moment for the code to be displayed
sleep 3

# Extract the code from the log
CODE=$(grep -o '[A-Z0-9]\{4\}-[A-Z0-9]\{4\}' /tmp/gh-auth.log | head -1)

if [ -n "$CODE" ]; then
    echo ""
    echo "📋 Your authentication code: $CODE"
    echo "🌐 If browser didn't open, visit: https://github.com/login/device"
    echo ""
    echo "⏳ Waiting for you to complete authentication..."
    echo "   (Press Enter after you've completed authentication in the browser)"
    read
fi

# Wait for the auth process
wait $AUTH_PID 2>/dev/null

# Check if authenticated
if gh auth status &> /dev/null; then
    echo "✅ Authentication successful!"
    echo ""
    echo "📦 Creating GitHub repository 'saree4ever'..."
    gh repo create saree4ever --public --source=. --remote=origin --push
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Success! Your repository has been created and pushed to GitHub!"
        USERNAME=$(gh api user --jq .login 2>/dev/null)
        echo "🌐 View it at: https://github.com/$USERNAME/saree4ever"
    else
        echo "❌ Failed to create repository."
        exit 1
    fi
else
    echo "❌ Authentication failed or not completed."
    echo "Please run: gh auth login"
    exit 1
fi

