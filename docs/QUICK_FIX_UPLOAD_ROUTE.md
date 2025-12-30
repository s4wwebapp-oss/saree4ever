# Quick Fix: Upload Route Not Found

## Error
```
Route not found
at /api/upload/hero-slide
```

## Solution

### Step 1: Restart Backend Server
The backend server needs to be restarted to load the new upload route:

```bash
# Stop the current backend server (Ctrl+C)
# Then restart:
cd "saree4ever/backend"
npm run dev
```

### Step 2: Verify Backend is Running
You should see:
```
🚀 Server is running on port 5001
📍 Health check: http://localhost:5001/health
📦 API: http://localhost:5001/api
```

### Step 3: Test the Route
Test if the route exists:
```bash
curl http://localhost:5001/api/upload/hero-slide
```

You should get a response (even if it's an auth error, that means the route exists).

### Step 4: Try Upload Again
Go back to the admin panel and try uploading an image again.

## If Still Not Working

1. **Check Backend Logs**: Look for any errors when starting the server
2. **Verify Route File**: Make sure `backend/src/routes/upload.ts` exists
3. **Check Import**: Verify `uploadRoutes` is imported in `backend/src/index.ts`
4. **Check Route Registration**: Ensure `app.use('/api/upload', uploadRoutes);` is in `backend/src/index.ts`

## Common Issues

- **Backend not running**: Start it with `npm run dev` in the backend folder
- **Port conflict**: Make sure port 5001 is available
- **TypeScript compilation**: If using TypeScript, make sure it compiles without errors


