# Supabase MCP Server Configuration Guide

## Current Status

✅ **Supabase MCP Server**: Connected  
📍 **Current Project**: `mukpamyclpdogvbvuaoq.supabase.co`

---

## How to Change Supabase MCP Server

The Supabase MCP server is configured in **Cursor Settings**, not in project files.

### Step 1: Open Cursor Settings

1. **macOS**: `Cmd + ,` or `Cursor → Settings`
2. **Windows/Linux**: `Ctrl + ,` or `File → Preferences → Settings`

### Step 2: Find MCP Settings

1. Search for "MCP" in settings
2. Or go to: **Settings → Features → Model Context Protocol**

### Step 3: Configure Supabase MCP Server

You'll need to update the Supabase MCP server configuration with:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-supabase"
      ],
      "env": {
        "SUPABASE_URL": "https://your-project-ref.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "your-service-role-key"
      }
    }
  }
}
```

---

## Option 1: Use Existing Supabase Project

### Get Your Supabase Credentials

1. **Go to**: https://supabase.com/dashboard
2. **Select your project** (or create a new one)
3. **Get Project URL**:
   - Settings → API → Project URL
   - Example: `https://abcdefghijklmnop.supabase.co`

4. **Get Service Role Key**:
   - Settings → API → Service Role Key (⚠️ Keep this secret!)
   - This is different from the anon key

### Update MCP Configuration

In Cursor Settings → MCP, update:

```json
{
  "SUPABASE_URL": "https://your-project-ref.supabase.co",
  "SUPABASE_SERVICE_ROLE_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## Option 2: Create New Supabase Project

### Step 1: Create Project

1. Go to: https://supabase.com
2. Click **"New Project"**
3. Fill in:
   - **Name**: `saree4ever` (or your preferred name)
   - **Database Password**: (save this!)
   - **Region**: Choose closest to you
4. Click **"Create new project"**
5. Wait 2-3 minutes for setup

### Step 2: Get Credentials

1. Go to **Settings → API**
2. Copy:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Step 3: Run Database Migrations

```bash
# Update backend/.env with new connection string
cd backend

# Get connection string from Supabase:
# Settings → Database → Connection string → URI
# Format: postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres

# Update .env
DB_HOST=db.xxxxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_database_password

# Or use connection string
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

### Step 4: Run Migrations

```bash
cd backend
npm run migrate
npm run seed
```

### Step 5: Update MCP Configuration

In Cursor Settings → MCP, set:

```json
{
  "SUPABASE_URL": "https://your-new-project-ref.supabase.co",
  "SUPABASE_SERVICE_ROLE_KEY": "your-new-service-role-key"
}
```

### Step 6: Restart Cursor

Restart Cursor to apply MCP changes.

---

## Option 3: Use Supabase for Backend Database

If you want to use Supabase as your backend database (instead of local PostgreSQL):

### Step 1: Get Connection String

From Supabase Dashboard:
- **Settings → Database → Connection string**
- Select **"URI"** format
- Copy the connection string

### Step 2: Update Backend `.env`

```bash
cd backend
```

Create/update `.env`:

```env
# Supabase Connection
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres

# Or individual settings
DB_HOST=db.xxxxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_database_password

# Other settings
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
PORT=3000
```

### Step 3: Run Migrations

```bash
npm run migrate
npm run seed
```

### Step 4: Test Connection

```bash
npm run dev
```

Check logs - should see no "Database not available" warnings.

---

## Verify MCP Connection

After updating, test the connection:

1. **Ask AI**: "List all tables in Supabase"
2. **Check**: Should return your database tables
3. **If error**: Verify credentials in Cursor Settings

---

## Troubleshooting

### Error: "Invalid API key"

**Solution:**
- Make sure you're using **Service Role Key**, not anon key
- Service Role Key starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- Get it from: Settings → API → Service Role Key

### Error: "Project not found"

**Solution:**
- Verify Project URL is correct
- Format: `https://xxxxx.supabase.co` (no trailing slash)
- Check project is active in Supabase dashboard

### Error: "Connection refused"

**Solution:**
- Check if project is paused (free tier pauses after inactivity)
- Resume project in Supabase dashboard
- Wait 1-2 minutes for project to start

### MCP Server Not Working

**Solution:**
1. Restart Cursor completely
2. Check Cursor Settings → MCP → Supabase configuration
3. Verify environment variables are set correctly
4. Check Cursor logs for MCP errors

---

## Quick Reference

### Supabase Dashboard Links

- **Dashboard**: https://supabase.com/dashboard
- **API Settings**: Settings → API
- **Database Settings**: Settings → Database
- **Table Editor**: Table Editor (left sidebar)

### Important Keys

- **Anon Key**: Public, safe for frontend
- **Service Role Key**: ⚠️ Secret! Only for backend/MCP
- **Database Password**: Set during project creation

### Connection String Format

```
postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
```

---

## Next Steps

After configuring Supabase MCP:

1. ✅ **Run Migrations**: `cd backend && npm run migrate`
2. ✅ **Seed Data**: `cd backend && npm run seed`
3. ✅ **Test Connection**: Check backend logs
4. ✅ **Use MCP Tools**: Ask AI to manage database via MCP
5. ✅ **Update Backend**: Point backend to Supabase database

---

**Need Help?** Check Supabase documentation: https://supabase.com/docs

