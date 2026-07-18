import { Pool, neonConfig } from '@neondatabase/serverless';

// Configure Neon to use WebSockets or direct HTTP when required
export default async function handler(req, res) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, X-Neon-Connection');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const { action, sql, params = [], connectionString } = req.body || {};
  const dbUrl = connectionString || req.headers['x-neon-connection'] || process.env.DATABASE_URL;

  if (!dbUrl) {
    return res.status(400).json({ 
      error: 'No Neon connection string provided. Set DATABASE_URL or pass connectionString from client.' 
    });
  }

  const pool = new Pool({ connectionString: dbUrl });

  try {
    if (action === 'setup') {
      // Execute schema setup commands
      const schemaSql = `
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(64) PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          password_hash VARCHAR(255),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS transactions (
          id VARCHAR(64) PRIMARY KEY,
          user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
          amount DECIMAL(12, 2) NOT NULL,
          category VARCHAR(64) NOT NULL,
          date DATE NOT NULL,
          note TEXT,
          type VARCHAR(16) DEFAULT 'expense',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS subscriptions (
          id VARCHAR(64) PRIMARY KEY,
          user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          amount DECIMAL(12, 2) NOT NULL,
          billing_cycle VARCHAR(16) DEFAULT 'monthly',
          next_due_date DATE NOT NULL,
          remind_days INTEGER DEFAULT 3,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS tasks (
          id VARCHAR(64) PRIMARY KEY,
          user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          due_date DATE NOT NULL,
          priority VARCHAR(16) DEFAULT 'medium',
          completed BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS workouts (
          id VARCHAR(64) PRIMARY KEY,
          user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
          date DATE NOT NULL,
          exercise_name VARCHAR(255) NOT NULL,
          total_volume DECIMAL(12, 2) DEFAULT 0.00,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS workout_sets (
          id VARCHAR(64) PRIMARY KEY,
          workout_id VARCHAR(64) REFERENCES workouts(id) ON DELETE CASCADE,
          set_number INTEGER NOT NULL,
          reps INTEGER NOT NULL,
          weight DECIMAL(10, 2) NOT NULL
        );
        CREATE TABLE IF NOT EXISTS diet_plans (
          id VARCHAR(64) PRIMARY KEY,
          user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          image_data TEXT NOT NULL,
          upload_date DATE NOT NULL,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, date);
        CREATE INDEX IF NOT EXISTS idx_tasks_user_date ON tasks(user_id, due_date);
        CREATE INDEX IF NOT EXISTS idx_workouts_user_exercise ON workouts(user_id, exercise_name);
      `;
      await pool.query(schemaSql);
      await pool.end();
      return res.status(200).json({ success: true, message: 'Neon database tables created successfully.' });
    }

    if (!sql) {
      await pool.end();
      return res.status(400).json({ error: 'No SQL query provided.' });
    }

    const result = await pool.query(sql, params);
    await pool.end();

    return res.status(200).json({
      success: true,
      rows: result.rows,
      rowCount: result.rowCount
    });
  } catch (err) {
    await pool.end();
    console.error('Neon Query Error:', err);
    return res.status(500).json({ error: err.message || 'Database execution error' });
  }
}
