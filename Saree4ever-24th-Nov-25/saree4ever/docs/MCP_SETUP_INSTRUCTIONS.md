# MCP Supabase Setup Instructions

## ✅ Configuration Added

The Supabase MCP server has been added to your Cursor configuration at `~/.cursor/mcp.json`.

### Current Configuration

```json
{
  "supabase": {
    "url": "https://mcp.supabase.com/mcp?project_ref=vjgxuamvrnmulvdajvid"
  }
}
```

**Project**: `vjgxuamvrnmulvdajvid` (scoped to your specific project)

## Next Steps to Connect

### Step 1: Restart Cursor

1. **Close Cursor completely**
   - Quit the application (not just close the window)
   - On Mac: `Cmd + Q` or `Cursor` → `Quit Cursor`

2. **Reopen Cursor**
   - Launch Cursor again
   - Wait a few seconds for MCP servers to initialize

### Step 2: Authenticate with Supabase

1. **Open Cursor Settings**
   - Press `Cmd + ,` (Mac) or `Ctrl + ,` (Windows/Linux)
   - Or go to `Cursor` → `Settings`

2. **Navigate to MCP Settings**
   - Go to `Features` → `MCP`
   - Or search for "MCP" in settings

3. **Find Supabase MCP Server**
   - Look for "supabase" in the list of MCP servers
   - You should see it listed with the URL

4. **Authenticate**
   - Click on the Supabase MCP server
   - If there's an "Authenticate" or "Connect" button, click it
   - A browser window will open
   - Log in to your Supabase account
   - Grant access to the MCP client
   - Select your organization (if prompted)

### Step 3: Verify Connection

After authentication, test the connection by asking the AI:

- "List my Supabase projects"
- "Show my database tables"
- "Query my Supabase database"
- "What tables are in my database?"

If these commands work, the MCP connection is active! ✅

## Troubleshooting

### MCP Server Not Appearing

1. **Check Cursor Version**
   - Make sure you're using the latest version of Cursor
   - Go to `Cursor` → `Check for Updates`

2. **Verify Configuration File**
   - Check that `~/.cursor/mcp.json` exists
   - Verify the JSON is valid (no syntax errors)

3. **Check Cursor Logs**
   - Open Cursor's developer console
   - Look for MCP-related errors

### Authentication Issues

1. **Re-authenticate**
   - Disconnect the Supabase MCP server
   - Reconnect and try authenticating again

2. **Check Supabase Account**
   - Make sure you're logged into the correct Supabase account
   - Verify you have access to project `vjgxuamvrnmulvdajvid`

3. **Browser Blocked**
   - Make sure your browser allows pop-ups
   - Try authenticating in a different browser

### Connection Timeout

1. **Check Internet Connection**
   - Verify you can access `https://mcp.supabase.com`

2. **Test URL**
   ```bash
   curl https://mcp.supabase.com/mcp
   ```

3. **Remove Project Scope** (if needed)
   - Temporarily remove `?project_ref=vjgxuamvrnmulvdajvid` from the URL
   - This will give access to all projects (less secure)

## Configuration Options

### Current Setup (Project-Scoped)
```json
{
  "supabase": {
    "url": "https://mcp.supabase.com/mcp?project_ref=vjgxuamvrnmulvdajvid"
  }
}
```
✅ **Recommended**: Limits access to one project only

### All Projects Access
```json
{
  "supabase": {
    "url": "https://mcp.supabase.com/mcp"
  }
}
```
⚠️ **Less Secure**: Gives access to all projects in your account

## What You Can Do Once Connected

Once the MCP Supabase is connected, you can:

- ✅ Query your database using natural language
- ✅ Generate SQL queries and migrations
- ✅ Manage your database schema
- ✅ Access Supabase resources directly
- ✅ Create tables, views, and functions
- ✅ Manage storage buckets
- ✅ View and modify data

## Quick Test

After restarting Cursor and authenticating, try:

```
"Show me all tables in my Supabase database"
```

If you get a response with your tables, the setup is complete! 🎉

## Need Help?

- See full guide: `docs/MCP_SUPABASE_SETUP.md`
- Quick start: `docs/MCP_QUICK_START.md`
- Official docs: https://supabase.com/docs/guides/getting-started/mcp


