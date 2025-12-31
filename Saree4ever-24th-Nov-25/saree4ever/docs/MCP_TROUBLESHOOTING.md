# MCP Supabase Connection Troubleshooting

## Error: Connection Timeout

If you're seeing errors like:
```
fetch failed: Connect Timeout Error
Error connecting to streamableHttp server
SSE error: TypeError: fetch failed: Connect Timeout Error
```

## Solutions

### Solution 1: Check Network Connection

1. **Test Supabase MCP Server Accessibility**
   ```bash
   curl https://mcp.supabase.com/mcp
   ```

2. **Check Internet Connection**
   - Ensure you have a stable internet connection
   - Try accessing https://supabase.com in your browser

3. **Check Firewall/Proxy**
   - If you're behind a corporate firewall, it might be blocking the connection
   - Try from a different network (mobile hotspot, home network)

### Solution 2: Verify Configuration

1. **Check MCP Configuration File**
   ```bash
   cat ~/.cursor/mcp.json
   ```

2. **Verify JSON is Valid**
   - Make sure there are no syntax errors
   - Ensure proper commas and brackets

3. **Current Configuration Should Be**:
   ```json
   {
     "mcpServers": {
       "supabase": {
         "url": "https://mcp.supabase.com/mcp?project_ref=vjgxuamvrnmulvdajvid"
       }
     }
   }
   ```

### Solution 3: Try Without Project Scope

If the connection still fails, try removing the project scope temporarily:

1. **Edit `~/.cursor/mcp.json`**
   ```json
   {
     "mcpServers": {
       "supabase": {
         "url": "https://mcp.supabase.com/mcp"
       }
     }
   }
   ```

2. **Restart Cursor**
   - Quit completely and reopen

### Solution 4: Check Cursor MCP Settings

1. **Open Cursor Settings** (`Cmd + ,`)
2. **Go to Features → MCP**
3. **Check for Supabase**
   - Should appear in the list
   - Check for any error messages
   - Try disconnecting and reconnecting

### Solution 5: Authentication Issues

The connection timeout might be due to incomplete authentication:

1. **Clear MCP Cache** (if exists)
   ```bash
   rm -rf ~/.cursor/projects/*/mcp-cache.json
   ```

2. **Re-authenticate**
   - Go to Cursor Settings → MCP
   - Remove Supabase MCP server
   - Add it again
   - Complete authentication in browser

### Solution 6: Alternative Configuration

Try using the full configuration with explicit type:

```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=vjgxuamvrnmulvdajvid",
      "headers": {}
    }
  }
}
```

### Solution 7: Check Cursor Version

1. **Update Cursor**
   - Go to `Cursor` → `Check for Updates`
   - Install the latest version
   - MCP support may require a recent version

### Solution 8: Manual Authentication (If Needed)

If automatic authentication fails, you might need to use a Personal Access Token:

1. **Generate PAT in Supabase**
   - Go to https://supabase.com/dashboard/account/tokens
   - Create a new token
   - Copy the token

2. **Update Configuration** (for CI/manual auth):
   ```json
   {
     "mcpServers": {
       "supabase": {
         "type": "http",
         "url": "https://mcp.supabase.com/mcp?project_ref=vjgxuamvrnmulvdajvid",
         "headers": {
           "Authorization": "Bearer YOUR_ACCESS_TOKEN"
         }
       }
     }
   }
   ```

## Common Issues

### Issue: "No server info found"
- **Cause**: MCP server not properly initialized
- **Fix**: Restart Cursor completely

### Issue: "Connect Timeout Error"
- **Cause**: Network/firewall blocking connection
- **Fix**: Check network, try different network, check firewall settings

### Issue: "SSE error"
- **Cause**: Server-Sent Events connection failed
- **Fix**: Usually network-related, try solutions above

## Still Not Working?

1. **Check Supabase Status**
   - Visit https://status.supabase.com
   - Check if MCP service is operational

2. **Try Different Approach**
   - Use Supabase Dashboard directly
   - Use Supabase CLI instead
   - Use Supabase client libraries in code

3. **Contact Support**
   - Supabase: https://supabase.com/support
   - Cursor: Check Cursor documentation or support

## Verification

Once connected, you should be able to:
- See Supabase MCP in Cursor Settings → MCP
- Ask AI: "List my Supabase projects"
- Execute SQL queries through MCP

## Quick Test Commands

After fixing the connection, test with:
```
"Show me my Supabase database tables"
"List my Supabase projects"
"Query my Supabase database"
```


