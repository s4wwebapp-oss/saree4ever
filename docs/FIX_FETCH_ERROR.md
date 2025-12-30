# Fix: Fetch Failed Error

## Problem
The frontend is getting "fetch failed" errors when trying to connect to the backend API.

## Solution

### 1. Check if Backend Server is Running

The backend server needs to be running on port 5001. Check if it's running:

```bash
# In the backend directory
cd backend
npm run dev
```

You should see:
```
Server running on port 5001
```

### 2. Verify Backend Health

Open in browser or use curl:
```bash
curl http://localhost:5001/health
```

Should return:
```json
{"status":"ok","message":"Server is running"}
```

### 3. Check API Endpoint

Test the hero slides endpoint:
```bash
curl http://localhost:5001/api/hero-slides/active
```

### 4. Verify Environment Variables

Make sure `NEXT_PUBLIC_API_URL` is set correctly in `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

### 5. Check CORS Configuration

The backend should allow requests from `http://localhost:3000`. Check `backend/server.js`:

```javascript
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
};
```

## What I Fixed

1. **Better Error Handling**: Added specific error messages for network failures
2. **Fallback Data**: Added fallback hero slides and testimonials if API fails
3. **Graceful Degradation**: Page will still load even if some API calls fail

## Current Status

- ✅ Error handling improved
- ✅ Fallback data added
- ✅ Page will load even if backend is down
- ⚠️ Backend server needs to be running for full functionality

## Quick Start

1. **Start Backend**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend** (in another terminal):
   ```bash
   cd frontend
   npm run dev
   ```

3. **Verify Both Are Running**:
   - Backend: http://localhost:5001/health
   - Frontend: http://localhost:3000

---

**Note**: The page will now show fallback content if the backend is not running, so you can still see the design and layout.


