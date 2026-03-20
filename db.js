import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * MongoDB Connection Configuration
 * Handles connection to MongoDB with proper error handling and retries
 */

// Set Mongoose strictQuery option
mongoose.set('strictQuery', true);

/**
 * Connect to MongoDB database
 * @returns {Promise<boolean>} - Returns true if connection successful, false otherwise
 */
export const connectToMongoDB = async () => {
  try {
    // Support both MONGO_URI and MONGODB_URI for backward compatibility
    const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI;

    // Validate MONGO_URI environment variable
    if (!mongoURI) {
      throw new Error(
        'MONGO_URI or MONGODB_URI environment variable is not defined. Please set it in your .env file.'
      );
    }

    if (typeof mongoURI !== 'string' || mongoURI.trim() === '') {
      throw new Error('MONGO_URI must be a non-empty string');
    }

    console.log('🔄 Connecting to MongoDB...');
    console.log(`📍 Connection string: ${mongoURI.substring(0, 20)}...`);

    // Connect to MongoDB with comprehensive options
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      retryWrites: true,
      retryReads: true,
      // Additional options for better reliability
      family: 4, // Use IPv4, skip trying IPv6
    });

    // Wait for connection to be fully established
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('MongoDB connection timeout'));
      }, 15000);

      if (mongoose.connection.readyState === 1) {
        clearTimeout(timeout);
        resolve();
      } else {
        mongoose.connection.once('open', () => {
          clearTimeout(timeout);
          resolve();
        });

        mongoose.connection.once('error', (error) => {
          clearTimeout(timeout);
          reject(error);
        });
      }
    });

    console.log('✅ MongoDB Connected Successfully');
    return true;
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error.message);
    console.error('Stack Trace:', error.stack);

    // Provide helpful error messages based on error type
    if (error.name === 'MongoServerError') {
      console.error('💡 This is a MongoDB server error. Check your MongoDB service status.');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.error('💡 DNS resolution failed. Check your MONGO_URI and internet connection.');
    } else if (error.message.includes('authentication failed')) {
      console.error('💡 MongoDB authentication failed. Check your username and password.');
    } else if (error.message.includes('connect ECONNREFUSED')) {
      console.error('💡 Connection refused. Ensure MongoDB is running and accessible.');
    }

    return false;
  }
};

/**
 * Disconnect from MongoDB database
 * @returns {Promise<void>}
 */
export const disconnectFromMongoDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('✅ MongoDB Disconnected Successfully');
  } catch (error) {
    console.error('❌ MongoDB Disconnection Error:', error.message);
    throw error;
  }
};

/**
 * Get MongoDB connection status
 * @returns {number} - Connection state (0=disconnected, 1=connected, 2=connecting, 3=disconnecting)
 */
export const getMongoDBConnectionStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  return {
    state: mongoose.connection.readyState,
    stateName: states[mongoose.connection.readyState],
  };
};

/**
 * Setup MongoDB event listeners for monitoring
 */
export const setupMongoDBEventListeners = () => {
  mongoose.connection.on('connected', () => {
    console.log('📡 MongoDB: Connected');
  });

  mongoose.connection.on('disconnected', () => {
    console.log('📡 MongoDB: Disconnected');
  });

  mongoose.connection.on('error', (error) => {
    console.error('📡 MongoDB Error:', error.message);
  });

  mongoose.connection.on('reconnectFailed', () => {
    console.error('📡 MongoDB: Failed to reconnect after retries');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('📡 MongoDB: Reconnected after disconnection');
  });
};

export default mongoose;
