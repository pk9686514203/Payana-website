import mongoose from 'mongoose';

export const isMongoConnected = () => mongoose.connection.readyState === 1;

/**
 * Matches requested production pattern: retries every 5s, logs success/errors.
 * dbName + family: 4 help Atlas on Render (payanaDB, SRV/DNS IPv4).
 */
export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }
  if (mongoose.connection.readyState === 2) {
    return;
  }

  try {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!uri) {
      console.error('MongoDB Error:', 'MONGO_URI (or MONGODB_URI) is not set');
      console.log('Retrying MongoDB connection...');
      setTimeout(connectDB, 5000);
      return;
    }

    mongoose.set('strictQuery', false);

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      dbName: 'payanaDB',
      family: 4,
    });

    console.log('MongoDB Connected ✅');
  } catch (err) {
    console.error('MongoDB Error:', err.message);
    console.log('Retrying MongoDB connection...');
    setTimeout(connectDB, 5000);
  }
};
