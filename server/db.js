import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

// Lazy initialization - database only connects when getDb() is called
let db = null;
let pool = null;

export function getDb() {
  if (!db && process.env.DATABASE_URL) {
    try {
      pool = new Pool({ connectionString: process.env.DATABASE_URL });
      db = drizzle(pool);
      console.log('✅ Database connection initialized');
    } catch (error) {
      console.warn('⚠️  Database connection failed:', error.message);
    }
  }
  return db;
}

export function getPool() {
  if (!pool && process.env.DATABASE_URL) {
    getDb(); // Initialize if needed
  }
  return pool;
}

// For backward compatibility
export { db };
