# Setting Up a New GitHub Repository

## Step 1: Create a New Repository on GitHub

1. **Go to GitHub:**
   - Visit https://github.com/new
   - Or click the "+" icon in the top right → "New repository"

2. **Repository Settings:**
   - **Repository name:** `saree4ever` (or your preferred name)
   - **Description:** (optional) e.g., "Saree4ever E-commerce Platform"
   - **Visibility:** Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have code)

3. **Click "Create repository"**

## Step 2: Update Git Remote

After creating the repository, GitHub will show you commands. Use one of these options:

### Option A: Change Existing Remote (Recommended)

```bash
# Remove the old remote
git remote remove origin

# Add your new repository as origin
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Verify the remote was added
git remote -v
```

### Option B: Add as New Remote (Keep Old One)

```bash
# Add new remote with a different name
git remote add new-origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to the new remote
git push -u new-origin main
```

## Step 3: Push Your Code

```bash
# Make sure you're on the main branch
git branch

# If not on main, switch to it
git checkout main

# Push to the new repository
git push -u origin main
```

## Step 4: Verify

1. Go to your new GitHub repository
2. Verify all files are there
3. Check that the commit history is correct

## Quick Command Reference

Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual values:

```bash
# Remove old remote
git remote remove origin

# Add new remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to new repository
git push -u origin main
```

## Troubleshooting

### If you get "remote origin already exists":
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

### If you get authentication errors:
- Use a Personal Access Token instead of password
- Or set up SSH keys for GitHub

### If you want to keep both remotes:
```bash
git remote add github https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u github main
```

---

**Need help?** Make sure you've:
- ✅ Created the repository on GitHub first
- ✅ Copied the correct repository URL
- ✅ Have write access to the repository

