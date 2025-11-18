import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";

neonConfig.webSocketConstructor = ws;

// Lazy initialization - only connect when actually used
let pool: Pool | null = null;
let db: any = null;

export function getDb() {
  if (!db && process.env.DATABASE_URL) {
    try {
      pool = new Pool({ connectionString: process.env.DATABASE_URL });
      db = drizzle({ client: pool });
      console.log('✅ Database connection initialized');
    } catch (error) {
      console.warn('⚠️  Database connection failed:', error);
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
