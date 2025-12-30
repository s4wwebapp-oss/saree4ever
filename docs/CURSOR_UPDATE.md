# How to Update Cursor IDE

## Current Version
Your current Cursor version: **2.1.20**

## Update Methods

### Method 1: Check for Updates (Recommended)

1. **Open Cursor**
   - Launch the Cursor application

2. **Check for Updates**
   - Click on `Cursor` in the menu bar (top left on Mac)
   - Select `Check for Updates...`
   - If an update is available, follow the on-screen instructions

3. **Restart Cursor**
   - After the update downloads, Cursor will prompt you to restart
   - Click "Restart" to apply the update

### Method 2: Download Latest Version

1. **Visit Cursor Website**
   - Go to [https://www.cursor.sh/](https://www.cursor.sh/)
   - Click "Download" button

2. **Download for macOS**
   - Select the macOS version (ARM64 for Apple Silicon, or Intel)
   - Download the `.dmg` file

3. **Install**
   - Open the downloaded `.dmg` file
   - Drag `Cursor.app` to your Applications folder
   - Replace the existing Cursor if prompted

4. **Restart Cursor**
   - Close and reopen Cursor to use the new version

### Method 3: Using Homebrew (if installed)

If you installed Cursor via Homebrew:

```bash
# Update Homebrew first
brew update

# Upgrade Cursor
brew upgrade cursor
```

## Verify Update

After updating, verify the new version:

```bash
cursor --version
```

Or check in Cursor:
- Go to `Cursor` → `About Cursor`

## Why Update?

Updating Cursor ensures you have:
- Latest features and improvements
- Bug fixes and security patches
- Better MCP (Model Context Protocol) support
- Improved AI capabilities
- Latest Supabase MCP server compatibility

## Troubleshooting

**Update not showing?**
- Make sure you have an internet connection
- Try restarting Cursor
- Check Cursor's website for the latest version

**Update failed?**
- Close all Cursor windows
- Try downloading the latest version manually
- Make sure you have admin permissions

**Need help?**
- Visit [Cursor Support](https://cursor.sh/support)
- Check [Cursor Documentation](https://cursor.sh/docs)

