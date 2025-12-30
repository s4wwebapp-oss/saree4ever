# Database Setup Guide

## Current Status

✅ **Schema & Code**: Complete  
⚠️ **Database Connection**: Not configured  
⚠️ **Migrations**: Not run  

The app currently runs in **mock data mode** (works without database).

---

## Option 1: Quick Setup (Local PostgreSQL)

### Step 1: Install PostgreSQL

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Linux:**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download from: https://www.postgresql.org/download/windows/

### Step 2: Create Database

```bash
# Connect to PostgreSQL
psql postgres

# Create database and user
CREATE DATABASE saree4ever;
CREATE USER saree4ever_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE saree4ever TO saree4ever_user;
\q
```

### Step 3: Configure Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=saree4ever
DB_USER=saree4ever_user
DB_PASSWORD=your_password
```

### Step 4: Run Migrations

```bash
cd backend
npm run migrate
```

Expected output:
```
Database migration completed successfully
```

### Step 5: Seed Initial Data

```bash
npm run seed
```

Expected output:
```
Seed data created successfully
```

### Step 6: Restart Backend

```bash
npm run dev
```

✅ **Database is now connected!**

---

## Option 2: Cloud Database (Recommended for Production)

### Using Supabase (Free Tier Available)

1. **Sign up**: https://supabase.com
2. **Create project**: "saree4ever"
3. **Get connection string**: Settings → Database → Connection string
4. **Update `.env`**:
   ```env
   DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
   ```

### Using Neon (Serverless PostgreSQL)

1. **Sign up**: https://neon.tech
2. **Create database**: "saree4ever"
3. **Copy connection string**
4. **Update `.env`** with connection string

### Using Railway

1. **Sign up**: https://railway.app
2. **Create PostgreSQL service**
3. **Copy connection string**
4. **Update `.env`**

---

## Option 3: Docker (Easiest for Development)

### Step 1: Create `docker-compose.yml`

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: saree4ever
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Step 2: Start Database

```bash
docker-compose up -d
```

### Step 3: Configure `.env`

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=saree4ever
DB_USER=postgres
DB_PASSWORD=postgres
```

### Step 4: Run Migrations

```bash
cd backend
npm run migrate
npm run seed
```

---

## Verify Database Connection

### Check Connection

The backend will automatically detect if database is available. Check logs:

```bash
cd backend
npm run dev
```

**If connected:**
- No "Database not available" warnings
- API calls use real database

**If not connected:**
- "Database not available, using mock data mode"
- App still works with mock data

### Test Query

```bash
psql -U postgres -d saree4ever
```

```sql
SELECT * FROM users;
SELECT * FROM products;
SELECT * FROM collections;
\q
```

---

## Troubleshooting

### Error: "Connection refused"

**Solution:**
- Check PostgreSQL is running: `brew services list` (macOS)
- Verify port 5432 is not blocked
- Check firewall settings

### Error: "Database does not exist"

**Solution:**
```bash
psql postgres
CREATE DATABASE saree4ever;
\q
```

### Error: "Password authentication failed"

**Solution:**
- Verify password in `.env` matches PostgreSQL user password
- Reset password: `ALTER USER postgres WITH PASSWORD 'new_password';`

### Error: "Permission denied"

**Solution:**
```sql
GRANT ALL PRIVILEGES ON DATABASE saree4ever TO your_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
```

---

## Migration Commands

```bash
# Run migrations
cd backend
npm run migrate

# Seed data
npm run seed

# Check tables
psql -U postgres -d saree4ever -c "\dt"
```

---

## Next Steps

After database is set up:

1. ✅ **Test Admin Login**: http://localhost:5001/admin/login
2. ✅ **Create Products**: Use admin panel
3. ✅ **Test Orders**: Complete a test checkout
4. ✅ **Verify Data**: Check data persists in database

---

## Current Status Check

To check if database is connected:

1. **Backend logs**: Look for "Database not available" message
2. **Admin panel**: Create a product → Check if it persists after restart
3. **API response**: Real database returns UUIDs, mock data returns simple IDs

---

**Need help?** Check backend logs or database connection status in terminal.

