import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

/**
 * Migration Script: Update all users with role 'agency' to 'agent'
 * 
 * Usage: node update-roles.js
 * 
 * This script:
 * 1. Connects to MongoDB using MONGO_URI
 * 2. Finds all users with role 'agency'
 * 3. Updates them to role 'agent'
 * 4. Logs the results
 * 5. Disconnects from the database
 */

async function updateUserRoles() {
  try {
    // Validate MONGO_URI
    if (!process.env.MONGO_URI && !process.env.MONGODB_URI) {
      throw new Error('MONGO_URI or MONGODB_URI environment variable is not defined');
    }

    const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI;
    
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB\n');

    // Find all users with role 'agency'
    console.log('🔍 Searching for users with role "agency"...');
    const usersWithAgencyRole = await User.find({ role: 'agency' });
    const count = usersWithAgencyRole.length;

    if (count === 0) {
      console.log('ℹ️  No users with role "agency" found.');
      await mongoose.disconnect();
      console.log('✅ Disconnected from MongoDB');
      return;
    }

    console.log(`Found ${count} user(s) with role "agency"\n`);

    // Display users to be updated
    console.log('📋 Users to be updated:');
    usersWithAgencyRole.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}`);
    });
    console.log('');

    // Update all users with role 'agency' to 'agent'
    console.log('⚙️  Updating roles...');
    const result = await User.updateMany(
      { role: 'agency' },
      { role: 'agent' }
    );

    console.log(`\n✅ Migration completed successfully!\n`);
    console.log('📊 Update Results:');
    console.log(`   - Matched: ${result.matchedCount} user(s)`);
    console.log(`   - Modified: ${result.modifiedCount} user(s)`);

    // Verify the update
    console.log('\n🔍 Verifying update...');
    const agencyRoleCount = await User.countDocuments({ role: 'agency' });
    const agentRoleCount = await User.countDocuments({ role: 'agent' });

    console.log(`   - Users with role "agency": ${agencyRoleCount}`);
    console.log(`   - Users with role "agent": ${agentRoleCount}`);

    if (agencyRoleCount === 0) {
      console.log('\n✨ All users successfully migrated from "agency" to "agent"!');
    } else {
      console.log(`\n⚠️  Warning: ${agencyRoleCount} user(s) still have role "agency"`);
    }

    // Display updated users
    const updatedUsers = await User.find({ role: 'agent' }).limit(10);
    console.log('\n📝 Sample of updated users:');
    updatedUsers.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error during migration:', error.message);
    console.error('Stack:', error.stack);
    
    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      console.error('Error disconnecting:', disconnectError.message);
    }
    
    process.exit(1);
  }
}

// Run the migration
updateUserRoles();
