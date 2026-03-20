# MongoDB Connection Setup Guide

This guide explains how to set up MongoDB connection for the Payana Travel Hub backend with proper error handling.

## Overview

The backend uses Mongoose to connect to MongoDB with proper configuration, error handling, and retry logic. The connection logic is centralized in `db.js` for better modularity and maintainability.

## Files

- **`db.js`** - Centralized MongoDB connection module with error handling and event listeners
- **`server.js`** - Express server that uses db.js for connection management
- **`.env.example`** - Template for environment variables (copy to `.env`)

## Setup Steps

### 1. Create `.env` File

Copy the `.env.example` file to `.env` in the backend directory:

```bash
cp .env.example .env
```

### 2. Configure MONGO_URI

Set your MongoDB connection string in the `.env` file:

```env
MONGO_URI=mongodb+srv://username:password@cluster-name.mongodb.net/payana-hub?retryWrites=true&w=majority
```

### MongoDB Connection String Formats

#### For MongoDB Atlas (Cloud - Recommended)
```
mongodb+srv://username:password@cluster-name.mongodb.net/database-name?retryWrites=true&w=majority
```

Replace with your actual values:
- `username` - Your MongoDB Atlas user
- `password` - Your MongoDB Atlas password (URL encoded if it contains special characters)
- `cluster-name` - Your cluster name (e.g., `cluster0`)
- `database-name` - Your database name (e.g., `payana-hub`)

#### For Local MongoDB
```
mongodb://localhost:27017/payana-hub
```

Make sure MongoDB is running on your local machine.

### 3. Install Dependencies

```bash
npm install
```

Required packages:
- `mongoose` - MongoDB ODM
- `dotenv` - Environment variable management
- `express` - Web framework

## Connection Features

### ✅ Built-in Features

1. **Environment Variable Support**
   - Primary: `MONGO_URI`
   - Fallback: `MONGODB_URI` (for backward compatibility)

2. **Comprehensive Error Handling**
   - Validates environment variables
   - Provides helpful error messages
   - Identifies common connection issues
   - Includes stack traces for debugging

3. **Connection Options**
   - Connection pooling (min: 2, max: 10)
   - Retry logic for failed connections
   - Timeouts: 10s connection, 45s socket, 15s selection
   - IPv4 preference for reliability
   - Strict query mode enabled
   - Write and read retries enabled

4. **Event Listeners**
   - Connection established
   - Connection disconnected
   - Reconnection attempts
   - Error tracking

5. **Health Check Endpoint**
   - `GET /api/health` - Returns server and database status

## Usage

### In Express Server

```javascript
import {
  connectToMongoDB,
  disconnectFromMongoDB,
  getMongoDBConnectionStatus,
  setupMongoDBEventListeners
} from './db.js';

// Setup event listeners
setupMongoDBEventListeners();

// Connect to database
const connected = await connectToMongoDB();

if (!connected) {
  console.error('Failed to connect to MongoDB');
  process.exit(1);
}

// Your app logic here...

// Graceful shutdown
process.on('SIGTERM', async () => {
  await disconnectFromMongoDB();
  process.exit(0);
});
```

### Available Functions

#### `connectToMongoDB()`
- Connects to MongoDB using MONGO_URI or MONGODB_URI
- Returns: `boolean` - true if connected, false otherwise
- Includes comprehensive error handling and validation

#### `disconnectFromMongoDB()`
- Cleanly disconnects from MongoDB
- Returns: `Promise<void>`
- Useful for graceful shutdown

#### `getMongoDBConnectionStatus()`
- Gets current connection status
- Returns: `{ state: number, stateName: string }`
- States: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting

#### `setupMongoDBEventListeners()`
- Sets up connection event listeners for monitoring
- Logs: connected, disconnected, errors, reconnection

## Common Errors and Solutions

### ❌ "MONGO_URI environment variable is not defined"
**Cause**: Missing `.env` file or MONGO_URI not set

**Solution**:
1. Create `.env` file from `.env.example`
2. Add your MongoDB connection string to MONGO_URI

### ❌ "DNS resolution failed" (ENOTFOUND)
**Cause**: Invalid connection string or no internet connection

**Solution**:
1. Verify MONGO_URI format is correct
2. Check internet connection
3. For MongoDB Atlas, ensure IP whitelist includes your IP

### ❌ "authentication failed"
**Cause**: Wrong username or password in connection string

**Solution**:
1. Verify credentials in MongoDB Atlas
2. Check if password contains special characters (must be URL encoded)
3. Ensure user has access to the database

### ❌ "connect ECONNREFUSED"
**Cause**: MongoDB service not running or wrong host/port

**Solution**:
1. For local MongoDB: Start MongoDB service
   - Windows: `net start MongoDB` or start MongoDB service
   - macOS: `brew services start mongodb-community`
   - Linux: `sudo systemctl start mongod`
2. For MongoDB Atlas: Verify connection string and IP whitelist

### ❌ "connection timeout"
**Cause**: Network issues or MongoDB service unreachable

**Solution**:
1. Check network connectivity
2. Verify firewall rules
3. For Render/deployment: Check environment variables are set correctly

## Testing Connection

### Using Health Endpoint
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "message": "Server is running",
  "database": "connected",
  "timestamp": "2024-03-20T10:30:00.000Z"
}
```

### Using Connection Test Script
```bash
npm run test:db
```

## Development vs Production

### Development
- Use local MongoDB or MongoDB Atlas
- Can log detailed debug information
- Connection failures don't crash the server (warnings only)

### Production
- Must use MongoDB Atlas or managed MongoDB
- Enable all security features (authentication, IP whitelist)
- Connection failures will crash the server (exit code 1)
- Monitor connection health with `/api/health` endpoint

## Environment Variables Checklist

- [ ] Create `.env` file
- [ ] Set `MONGO_URI` with valid connection string
- [ ] Verify no typos in connection string
- [ ] Test with health endpoint
- [ ] Check console for connection logs

## Monitoring

### Check Connection Status
```bash
# Console logs show:
# 🔄 Connecting to MongoDB...
# ✅ MongoDB Connected Successfully
# 📡 MongoDB: Connected
```

### Monitor Events
The connection automatically logs:
- Connection success/failure
- Disconnection events
- Reconnection attempts
- Errors with helpful suggestions

## Additional Resources

- [Mongoose Connection Docs](https://mongoosejs.com/docs/connections.html)
- [MongoDB URI Format](https://docs.mongodb.com/manual/reference/connection-string/)
- [MongoDB Atlas Setup](https://docs.atlas.mongodb.com/getting-started/)
- [Render.com Deployment](https://render.com/docs/deploy-node)

## Troubleshooting

For detailed error analysis:
1. Check console output for error messages
2. Verify `.env` file has correct MONGO_URI
3. Check MongoDB Atlas security settings
4. Review connection string format
5. Test connectivity: `ping cluster-name.mongodb.net`

If issues persist, refer to the error messages in the console - they include specific guidance for common problems.
