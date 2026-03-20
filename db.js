import mongoose from 'mongoose';

let connectionStatus = {
  stateName: 'disconnected',
  readyState: 0,
};

export const connectToMongoDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      console.log('✅ Already connected to MongoDB');
      return true;
    }

    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.warn('⚠️  MONGO_URI not set in environment variables');
      return false;
    }

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      retryWrites: true,
      w: 'majority',
    });

    connectionStatus = {
      stateName: 'connected',
      readyState: mongoose.connection.readyState,
    };

    console.log('✅ MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    connectionStatus = {
      stateName: 'disconnected',
      readyState: mongoose.connection.readyState,
    };
    return false;
  }
};

export const disconnectFromMongoDB = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️  Not connected to MongoDB');
      return;
    }

    await mongoose.disconnect();
    connectionStatus = {
      stateName: 'disconnected',
      readyState: mongoose.connection.readyState,
    };

    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error disconnecting from MongoDB:', error.message);
  }
};

export const getMongoDBConnectionStatus = () => {
  return {
    ...connectionStatus,
    readyState: mongoose.connection.readyState,
  };
};

export const setupMongoDBEventListeners = () => {
  mongoose.connection.on('connected', () => {
    connectionStatus.stateName = 'connected';
    console.log('📍 MongoDB connection event: connected');
  });

  mongoose.connection.on('disconnected', () => {
    connectionStatus.stateName = 'disconnected';
    console.log('📍 MongoDB connection event: disconnected');
  });

  mongoose.connection.on('error', (err) => {
    connectionStatus.stateName = 'error';
    console.error('📍 MongoDB connection error:', err.message);
  });

  mongoose.connection.on('reconnected', () => {
    connectionStatus.stateName = 'connected';
    console.log('📍 MongoDB connection event: reconnected');
  });
};
