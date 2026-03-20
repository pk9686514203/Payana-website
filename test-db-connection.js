/**
 * MongoDB Connection Test Script
 * Run this to verify MongoDB connection before starting the backend
 * 
 * Usage:
 * node test-db-connection.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const testMongoDBConnection = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    console.log('\n🧪 MongoDB Connection Test\n');
    console.log('═'.repeat(50));

    // Check if URI is defined
    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in .env file');
    }

    console.log('✓ MONGODB_URI is defined');
    console.log(`✓ URI (first 60 chars): ${mongoURI.substring(0, 60)}...`);

    // Attempt connection
    console.log('\n🔄 Connecting to MongoDB...\n');

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const connectionState = mongoose.connection.readyState;
    console.log(`✅ Successfully connected to MongoDB!`);
    console.log(`✓ Connection state: ${connectionState} (1 = connected)`);
    console.log(`✓ Database name: ${mongoose.connection.db.name}`);
    console.log(`✓ Host: ${mongoose.connection.host}`);
    console.log(`✓ Port: ${mongoose.connection.port}`);

    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`\n📦 Collections in database (${collections.length}):`);
    
    if (collections.length === 0) {
      console.log('   (No collections yet - this is normal for new database)');
    } else {
      collections.forEach((col, idx) => {
        console.log(`   ${idx + 1}. ${col.name}`);
      });
    }

    console.log('\n═'.repeat(50));
    console.log('✅ All checks passed! MongoDB is ready.\n');

    await mongoose.disconnect();
    console.log('✓ Disconnected gracefully\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ MongoDB Connection Test Failed\n');
    console.error('═'.repeat(50));
    console.error(`Error: ${error.message}`);
    console.error(`Code: ${error.code || 'N/A'}`);

    // Provide helpful hints
    console.error('\n💡 Troubleshooting tips:');

    if (error.message.includes('MONGODB_URI')) {
      console.error('   → Create backend/.env file with MONGODB_URI variable');
      console.error('   → Copy example from backend/.env.example');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.error('   → MongoDB is not running locally');
      console.error('   → For MongoDB Atlas, check connection string');
      console.error('   → Ensure IP is whitelisted in MongoDB Atlas');
    } else if (error.message.includes('authentication failed')) {
      console.error('   → Check MongoDB username and password');
      console.error('   → Verify username/password in connection string');
    } else if (error.message.includes('HostNotFound')) {
      console.error('   → Check cluster name in connection string');
      console.error('   → Verify MongoDB Atlas cluster is running');
    }

    console.error('\n═'.repeat(50) + '\n');
    process.exit(1);
  }
};

// Run test
testMongoDBConnection();
