import { Pool } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const connectionString = 'postgresql://neondb_owner:npg_g3WUPNJfEZk1@ep-ancient-base-auu6p8qy.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function main() {
  console.log('🔗 Connecting to Neon Serverless Postgres...');
  const pool = new Pool({ connectionString });

  try {
    const schemaPath = path.join(__dirname, '../neon-schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('⚡ Executing Neon schema migration commands...');
    await pool.query(schemaSql);

    console.log('✅ Success! All 7 tables (users, transactions, subscriptions, tasks, workouts, workout_sets, diet_plans) and indices created/verified successfully.');
    
    const res = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log('📊 Active tables in your Neon Database:');
    res.rows.forEach(r => console.log('   - ' + r.table_name));

  } catch (err) {
    console.error('❌ Migration Error:', err.message);
  } finally {
    await pool.end();
  }
}

main();
