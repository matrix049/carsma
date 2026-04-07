import mongoose from 'mongoose';

interface ConnectionOptions {
  maxRetries?: number;
  retryDelay?: number;
}

class DatabaseConnection {
  private maxRetries: number;
  private retryDelay: number;
  private currentRetry: number = 0;

  constructor(options: ConnectionOptions = {}) {
    this.maxRetries = options.maxRetries || 5;
    this.retryDelay = options.retryDelay || 5000;
  }

  async connect(): Promise<void> {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }

    await this.connectWithRetry(mongoUri);
    this.setupEventHandlers();
  }

  private async connectWithRetry(uri: string): Promise<void> {
    try {
      await mongoose.connect(uri);
      console.log('✓ MongoDB connected successfully');
      this.currentRetry = 0;
    } catch (error) {
      this.currentRetry++;
      
      if (this.currentRetry >= this.maxRetries) {
        console.error(`✗ Failed to connect to MongoDB after ${this.maxRetries} attempts`);
        throw error;
      }

      console.warn(
        `MongoDB connection attempt ${this.currentRetry} failed. ` +
        `Retrying in ${this.retryDelay / 1000} seconds...`
      );
      
      await this.delay(this.retryDelay);
      return this.connectWithRetry(uri);
    }
  }

  private setupEventHandlers(): void {
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✓ MongoDB reconnected successfully');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await this.disconnect();
      process.exit(0);
    });
  }

  async disconnect(): Promise<void> {
    try {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    } catch (error) {
      console.error('Error closing MongoDB connection:', error);
      throw error;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default DatabaseConnection;
