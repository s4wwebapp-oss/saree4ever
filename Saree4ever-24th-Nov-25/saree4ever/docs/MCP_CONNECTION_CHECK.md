# Checking Supabase MCP Connection

## Current Status

✅ **Configuration Found**: Supabase MCP is configured in `~/.cursor/mcp.json`
❌ **Not Connected**: MCP resources are not currently available

## Configuration Details

Your current Supabase MCP configuration:
- **URL**: `https://mcp.supabase.com/mcp?project_ref=vjgxuamvrnmulvdajvid`
- **Project**: Scoped to project `vjgxuamvrnmulvdajvid`
- **Authentication**: Using dynamic client registration (automatic)

## How to Connect

### Step 1: Restart Cursor
1. Close Cursor completely
2. Reopen Cursor
3. Wait a few seconds for MCP servers to initialize

### Step 2: Authenticate
1. Open Cursor Settings (`Cmd + ,`)
2. Go to `Features` → `MCP`
3. Look for "supabase" in the list
4. If you see an authentication prompt, click it
5. A browser window will open
6. Log in to your Supabase account
7. Grant access to the MCP client
8. Select your organization

### Step 3: Verify Connection
Try asking the AI assistant:
- "List my Supabase projects"
- "Show my Supabase database tables"
- "Query my Supabase database"

If these work, the connection is active!

## Troubleshooting

### MCP Server Not Appearing
- Check Cursor version (should be latest)
- Verify the configuration file is valid JSON
- Check Cursor's developer console for errors

### Authentication Failed
- Make sure you're logged into the correct Supabase account
- Verify you have access to project `vjgxuamvrnmulvdajvid`
- Try disconnecting and reconnecting the MCP server

### Connection Timeout
- Check your internet connection
- Verify you can access `https://mcp.supabase.com`
- Try removing the `project_ref` parameter to test

## Manual Test

You can test the MCP server URL directly:
```bash
curl https://mcp.supabase.com/mcp
```

This should return MCP server information if it's accessible.

## Next Steps

Once connected, you'll be able to:
- Query your Supabase database through the AI
- Generate SQL queries
- Manage your database schema
- Access Supabase resources

