import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

let db = null;

try {
  const connectionString = process.env.DATABASE_URL;
  
  if (connectionString) {
    const pool = new Pool({ connectionString });
    db = drizzle(pool);
    console.log('✅ Database connection established');
  } else {
    console.warn('⚠️  DATABASE_URL not configured, database features disabled');
  }
} catch (error) {
  console.error('❌ Database connection failed:', error.message);
}

export { db };
