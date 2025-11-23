# Quick GitHub Setup Guide

## Step 1: Install GitHub CLI (Choose ONE method)

### Option A: Using Homebrew (Recommended)
```bash
# Install Homebrew (if not already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install GitHub CLI
brew install gh
```

### Option B: Direct Download
1. Visit: https://github.com/cli/cli/releases/latest
2. Download the `gh_*_macOS_amd64.tar.gz` file
3. Extract it and move the `gh` binary to `/usr/local/bin/`:
   ```bash
   tar -xzf gh_*_macOS_amd64.tar.gz
   sudo mv gh_*/bin/gh /usr/local/bin/gh
   ```

## Step 2: Run the Setup Script

Once GitHub CLI is installed, run:

```bash
cd "/Users/abhishekmr/Desktop/website files/Saree4ever 24th Nov 25"
./create-repo.sh
```

This will:
- Authenticate with GitHub (will open browser)
- Create the repository on GitHub
- Push your code

---

**OR** if you prefer to do it manually after installing `gh`:

```bash
gh auth login
gh repo create saree4ever --public --source=. --remote=origin --push
```

