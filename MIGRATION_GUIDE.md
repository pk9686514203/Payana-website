# User Role Migration Guide

## Overview

This guide explains how to migrate all users with role `'agency'` to role `'agent'` in MongoDB.

## Files

- **update-roles.js** - Migration script that updates user roles
- **package.json** - Updated with npm script for running the migration

## Prerequisites

1. MongoDB connection must be available
2. `MONGO_URI` or `MONGODB_URI` environment variable must be set in `.env`
3. All dependencies installed with `npm install`

## Installation

The script is already created. No additional installation needed.

## Usage

### Option 1: Using npm script (Recommended)
```bash
npm run migrate:roles
```

### Option 2: Direct node execution
```bash
node update-roles.js
```

## What the Script Does

1. ✅ Connects to MongoDB using `MONGO_URI` or `MONGODB_URI`
2. 🔍 Searches for all users with role `'agency'`
3. 📋 Displays users that will be updated
4. ⚙️ Updates all matching users to role `'agent'`
5. ✨ Verifies the migration was successful
6. 📊 Shows update statistics
7. 🔌 Disconnects from MongoDB

## Example Output

```
🔄 Connecting to MongoDB...
✅ Connected to MongoDB

🔍 Searching for users with role "agency"...
Found 3 user(s) with role "agency"

📋 Users to be updated:
  1. SoaringX Admin (soaring.xofficial@gmail.com) - Role: agency
  2. John Doe (john@example.com) - Role: agency
  3. Jane Smith (jane@example.com) - Role: agency

⚙️  Updating roles...

✅ Migration completed successfully!

📊 Update Results:
   - Matched: 3 user(s)
   - Modified: 3 user(s)

🔍 Verifying update...
   - Users with role "agency": 0
   - Users with role "agent": 5

✨ All users successfully migrated from "agency" to "agent"!

📝 Sample of updated users:
  1. SoaringX Admin (soaring.xofficial@gmail.com) - Role: agent
  2. John Doe (john@example.com) - Role: agent
  3. Jane Smith (jane@example.com) - Role: agent

✅ Disconnected from MongoDB
```

## Safety Features

✅ **Environment Variable Validation** - Checks for MONGO_URI before connecting  
✅ **Pre-Update Display** - Shows all users that will be updated  
✅ **Verification** - Confirms the migration was successful  
✅ **Error Handling** - Comprehensive error messages and logging  
✅ **Graceful Disconnection** - Properly closes MongoDB connection on success or failure  
✅ **Safe Exit Codes** - Uses proper exit codes (0 for success, 1 for error)

## Error Handling

If the script encounters an error:
- Error message and stack trace are logged
- Database connection is properly closed
- Process exits with code 1 (error)

### Common Errors

**Error:** `MONGO_URI or MONGODB_URI environment variable is not defined`
- **Solution:** Create a `.env` file with `MONGO_URI` set to your MongoDB connection string

**Error:** `MongoServerError: authentication failed`
- **Solution:** Check your MongoDB credentials and IP whitelist (for MongoDB Atlas)

**Error:** `ECONNREFUSED`
- **Solution:** Ensure MongoDB is running and the connection string is correct

## Rollback

If you need to rollback the changes, use this MongoDB query:

```javascript
// In MongoDB shell or with a script
db.users.updateMany(
  { role: 'agent' },
  { $set: { role: 'agency' } }
)
```

Or create a rollback script:

```javascript
import User from './models/User.js';
await User.updateMany({ role: 'agent' }, { role: 'agency' });
```

## Advanced Usage

### Check users before migrating

```javascript
// In MongoDB shell
db.users.find({ role: 'agency' })
```

### Count users by role

```javascript
// In MongoDB shell
db.users.countDocuments({ role: 'agency' })
db.users.countDocuments({ role: 'agent' })
```

### Restore specific user (if needed)

```javascript
// In MongoDB shell
db.users.updateOne(
  { email: 'user@example.com' },
  { $set: { role: 'agency' } }
)
```

## Best Practices

1. **Backup First** - Always backup your database before running migrations
2. **Test in Development** - Run this script in a development environment first
3. **Schedule Downtime** - Run during low-traffic periods if possible
4. **Monitor** - Check user logs after migration to ensure no issues
5. **Document** - Keep a record of the migration for your team

## Monitoring

After running the migration:

1. Verify with `npm run test:db`
2. Check `/api/health` endpoint
3. Review user roles in your admin dashboard
4. Monitor application logs for any role-related errors

## Questions or Issues?

If you encounter issues:
1. Check the `.env` file for correct `MONGO_URI`
2. Verify MongoDB is running and accessible
3. Ensure the User model is working correctly
4. Check application logs for detailed error information

## Next Steps

After successful migration:
1. Commit changes: `git add . && git commit -m "migrated users from agency role to agent role"`
2. Push to repository: `git push`
3. Update any documentation referencing the old role
4. Monitor application for any issues

---

**Last Updated:** March 20, 2026  
**Script Version:** 1.0.0
