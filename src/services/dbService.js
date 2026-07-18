import Dexie from 'dexie';

// Initialize local offline IndexedDB cache via Dexie
export const localDB = new Dexie('UNItrackDB');

localDB.version(1).stores({
  users: 'id, email, name',
  transactions: 'id, user_id, category, date, type',
  subscriptions: 'id, user_id, next_due_date',
  tasks: 'id, user_id, due_date, priority, completed',
  workouts: 'id, user_id, date, exercise_name',
  workout_sets: 'id, workout_id, set_number',
  diet_plans: 'id, user_id, upload_date, is_active'
});

class DBService {
  constructor() {
    this.neonUrl = localStorage.getItem('unitrack_neon_url') || '';
    this.useNeon = localStorage.getItem('unitrack_use_neon') === 'true';
  }

  setNeonConnection(url, enabled = true) {
    this.neonUrl = url.trim();
    this.useNeon = enabled;
    localStorage.setItem('unitrack_neon_url', this.neonUrl);
    localStorage.setItem('unitrack_use_neon', String(enabled));
  }

  getNeonSettings() {
    return {
      url: this.neonUrl,
      enabled: this.useNeon
    };
  }

  async runNeonQuery(sql, params = []) {
    if (!this.useNeon && !this.neonUrl) return null;
    try {
      const response = await fetch('/api/db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Neon-Connection': this.neonUrl || ''
        },
        body: JSON.stringify({
          action: 'query',
          sql,
          params,
          connectionString: this.neonUrl || undefined
        })
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.warn('Neon API fallback error:', errorData.error || response.statusText);
        return null;
      }
      const data = await response.json();
      return data.rows || null;
    } catch (err) {
      console.warn('Offline or Neon sync unavailable, relying on Dexie local database.', err.message);
      return null;
    }
  }

  async setupNeonTables() {
    try {
      const response = await fetch('/api/db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Neon-Connection': this.neonUrl || ''
        },
        body: JSON.stringify({
          action: 'setup',
          connectionString: this.neonUrl || undefined
        })
      });
      const data = await response.json();
      return data;
    } catch (err) {
      throw new Error('Failed to setup Neon schema: ' + err.message);
    }
  }

  // ==========================================
  // AUTHENTICATION / USERS
  // ==========================================
  async getUser(email) {
    const user = await localDB.users.where('email').equals(email).first();
    if (user) return user;

    const neonRows = await this.runNeonQuery('SELECT * FROM users WHERE email = $1 LIMIT 1', [email]);
    if (neonRows && neonRows.length > 0) {
      await localDB.users.put(neonRows[0]);
      return neonRows[0];
    }
    return null;
  }

  async createUser({ id, email, name, password }) {
    const newUser = {
      id: id || 'usr_' + Date.now() + Math.random().toString(36).substr(2, 6),
      email,
      name,
      password_hash: password || '',
      created_at: new Date().toISOString()
    };

    await localDB.users.put(newUser);
    await this.runNeonQuery(
      'INSERT INTO users (id, email, name, password_hash, created_at) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING',
      [newUser.id, newUser.email, newUser.name, newUser.password_hash, newUser.created_at]
    );

    // Seed initial demo data for new users
    await this.seedDemoData(newUser.id);
    return newUser;
  }

  // ==========================================
  // MODULE 1: FINANCE TRACKER (Transactions & Subscriptions)
  // ==========================================
  async getTransactions(userId) {
    const localTx = await localDB.transactions.where('user_id').equals(userId).toArray();
    const neonRows = await this.runNeonQuery('SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC', [userId]);
    if (neonRows) {
      for (const row of neonRows) await localDB.transactions.put(row);
      return neonRows;
    }
    return localTx.sort((a, b) => b.date.localeCompare(a.date));
  }

  async addTransaction({ userId, amount, category, date, note, type = 'expense' }) {
    const tx = {
      id: 'tx_' + Date.now() + Math.random().toString(36).substr(2, 5),
      user_id: userId,
      amount: parseFloat(amount) || 0,
      category,
      date: date || new Date().toISOString().split('T')[0],
      note: note || '',
      type,
      created_at: new Date().toISOString()
    };
    await localDB.transactions.put(tx);
    await this.runNeonQuery(
      'INSERT INTO transactions (id, user_id, amount, category, date, note, type, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [tx.id, tx.user_id, tx.amount, tx.category, tx.date, tx.note, tx.type, tx.created_at]
    );
    return tx;
  }

  async deleteTransaction(id) {
    await localDB.transactions.delete(id);
    await this.runNeonQuery('DELETE FROM transactions WHERE id = $1', [id]);
  }

  async getSubscriptions(userId) {
    const localSubs = await localDB.subscriptions.where('user_id').equals(userId).toArray();
    const neonRows = await this.runNeonQuery('SELECT * FROM subscriptions WHERE user_id = $1 ORDER BY next_due_date ASC', [userId]);
    if (neonRows) {
      for (const row of neonRows) await localDB.subscriptions.put(row);
      return neonRows;
    }
    return localSubs.sort((a, b) => a.next_due_date.localeCompare(b.next_due_date));
  }

  async addSubscription({ userId, name, amount, billingCycle = 'monthly', nextDueDate, remindDays = 3 }) {
    const sub = {
      id: 'sub_' + Date.now() + Math.random().toString(36).substr(2, 5),
      user_id: userId,
      name,
      amount: parseFloat(amount) || 0,
      billing_cycle: billingCycle,
      next_due_date: nextDueDate,
      remind_days: parseInt(remindDays) || 3,
      created_at: new Date().toISOString()
    };
    await localDB.subscriptions.put(sub);
    await this.runNeonQuery(
      'INSERT INTO subscriptions (id, user_id, name, amount, billing_cycle, next_due_date, remind_days, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [sub.id, sub.user_id, sub.name, sub.amount, sub.billing_cycle, sub.next_due_date, sub.remind_days, sub.created_at]
    );
    return sub;
  }

  async deleteSubscription(id) {
    await localDB.subscriptions.delete(id);
    await this.runNeonQuery('DELETE FROM subscriptions WHERE id = $1', [id]);
  }

  // ==========================================
  // MODULE 2: TASK & TO-DO PLANNER
  // ==========================================
  async getTasks(userId, dateFilter = null) {
    let localTasks = await localDB.tasks.where('user_id').equals(userId).toArray();
    const neonRows = await this.runNeonQuery('SELECT * FROM tasks WHERE user_id = $1', [userId]);
    if (neonRows) {
      for (const row of neonRows) await localDB.tasks.put(row);
      localTasks = neonRows;
    }
    if (dateFilter) {
      return localTasks.filter(t => t.due_date === dateFilter);
    }
    return localTasks.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1);
    });
  }

  async addTask({ userId, title, description, dueDate, priority = 'medium' }) {
    const task = {
      id: 'tsk_' + Date.now() + Math.random().toString(36).substr(2, 5),
      user_id: userId,
      title,
      description: description || '',
      due_date: dueDate || new Date().toISOString().split('T')[0],
      priority,
      completed: false,
      created_at: new Date().toISOString()
    };
    await localDB.tasks.put(task);
    await this.runNeonQuery(
      'INSERT INTO tasks (id, user_id, title, description, due_date, priority, completed, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [task.id, task.user_id, task.title, task.description, task.due_date, task.priority, task.completed, task.created_at]
    );
    return task;
  }

  async toggleTask(id, completed) {
    await localDB.tasks.update(id, { completed });
    await this.runNeonQuery('UPDATE tasks SET completed = $1 WHERE id = $2', [completed, id]);
  }

  async deleteTask(id) {
    await localDB.tasks.delete(id);
    await this.runNeonQuery('DELETE FROM tasks WHERE id = $1', [id]);
  }

  async carryOverTasks(userId, fromDate, toDate) {
    const tasks = await localDB.tasks.where('user_id').equals(userId).toArray();
    const pendingToMove = tasks.filter(t => !t.completed && (t.due_date === fromDate || t.due_date < toDate));
    for (const t of pendingToMove) {
      await localDB.tasks.update(t.id, { due_date: toDate });
      await this.runNeonQuery('UPDATE tasks SET due_date = $1 WHERE id = $2', [toDate, t.id]);
    }
    return pendingToMove.length;
  }

  // ==========================================
  // MODULE 3: GYM / EXERCISE TRACKER
  // ==========================================
  async getWorkouts(userId) {
    const localWorkouts = await localDB.workouts.where('user_id').equals(userId).toArray();
    const localSets = await localDB.workout_sets.toArray();

    const neonWorkouts = await this.runNeonQuery('SELECT * FROM workouts WHERE user_id = $1 ORDER BY date DESC', [userId]);
    if (neonWorkouts) {
      for (const w of neonWorkouts) await localDB.workouts.put(w);
      const neonSets = await this.runNeonQuery('SELECT ws.* FROM workout_sets ws JOIN workouts w ON ws.workout_id = w.id WHERE w.user_id = $1', [userId]);
      if (neonSets) {
        for (const s of neonSets) await localDB.workout_sets.put(s);
      }
    }

    // Attach sets to each workout
    const baseList = neonWorkouts || localWorkouts;
    const result = await Promise.all(
      baseList.map(async (w) => {
        const wSets = await localDB.workout_sets.where('workout_id').equals(w.id).toArray();
        return {
          ...w,
          sets: wSets.sort((a, b) => (a.set_number || 0) - (b.set_number || 0))
        };
      })
    );
    return result.sort((a, b) => b.date.localeCompare(a.date));
  }

  async logWorkout({ userId, date, exerciseName, sets = [] }) {
    const totalVolume = sets.reduce((sum, s) => sum + (parseFloat(s.reps) * parseFloat(s.weight)), 0);
    const workout = {
      id: 'wkt_' + Date.now() + Math.random().toString(36).substr(2, 5),
      user_id: userId,
      date: date || new Date().toISOString().split('T')[0],
      exercise_name: exerciseName,
      total_volume: totalVolume,
      created_at: new Date().toISOString()
    };

    await localDB.workouts.put(workout);
    await this.runNeonQuery(
      'INSERT INTO workouts (id, user_id, date, exercise_name, total_volume, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
      [workout.id, workout.user_id, workout.date, workout.exercise_name, workout.total_volume, workout.created_at]
    );

    for (let i = 0; i < sets.length; i++) {
      const setItem = {
        id: 'set_' + Date.now() + '_' + i + '_' + Math.random().toString(36).substr(2, 4),
        workout_id: workout.id,
        set_number: i + 1,
        reps: parseInt(sets[i].reps) || 0,
        weight: parseFloat(sets[i].weight) || 0
      };
      await localDB.workout_sets.put(setItem);
      await this.runNeonQuery(
        'INSERT INTO workout_sets (id, workout_id, set_number, reps, weight) VALUES ($1, $2, $3, $4, $5)',
        [setItem.id, setItem.workout_id, setItem.set_number, setItem.reps, setItem.weight]
      );
    }

    return { ...workout, sets };
  }

  async deleteWorkout(id) {
    const sets = await localDB.workout_sets.where('workout_id').equals(id).toArray();
    for (const s of sets) await localDB.workout_sets.delete(s.id);
    await localDB.workouts.delete(id);
    await this.runNeonQuery('DELETE FROM workout_sets WHERE workout_id = $1', [id]);
    await this.runNeonQuery('DELETE FROM workouts WHERE id = $1', [id]);
  }

  // ==========================================
  // MODULE 4: DIET PLAN VIEWER
  // ==========================================
  async getDietPlans(userId) {
    const localPlans = await localDB.diet_plans.where('user_id').equals(userId).toArray();
    const neonRows = await this.runNeonQuery('SELECT * FROM diet_plans WHERE user_id = $1 ORDER BY upload_date DESC', [userId]);
    if (neonRows) {
      for (const row of neonRows) await localDB.diet_plans.put(row);
      return neonRows;
    }
    return localPlans.sort((a, b) => b.upload_date.localeCompare(a.upload_date));
  }

  async uploadDietPlan({ userId, title, imageData, uploadDate, isActive = true }) {
    if (isActive) {
      // Set others to inactive
      const all = await localDB.diet_plans.where('user_id').equals(userId).toArray();
      for (const p of all) {
        if (p.is_active) {
          await localDB.diet_plans.update(p.id, { is_active: false });
          await this.runNeonQuery('UPDATE diet_plans SET is_active = false WHERE id = $1', [p.id]);
        }
      }
    }

    const plan = {
      id: 'dpl_' + Date.now() + Math.random().toString(36).substr(2, 5),
      user_id: userId,
      title: title || 'Diet Chart ' + new Date().toLocaleDateString(),
      image_data: imageData,
      upload_date: uploadDate || new Date().toISOString().split('T')[0],
      is_active: isActive,
      created_at: new Date().toISOString()
    };

    await localDB.diet_plans.put(plan);
    await this.runNeonQuery(
      'INSERT INTO diet_plans (id, user_id, title, image_data, upload_date, is_active, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [plan.id, plan.user_id, plan.title, plan.image_data, plan.upload_date, plan.is_active, plan.created_at]
    );
    return plan;
  }

  async setActiveDietPlan(id, userId) {
    const all = await localDB.diet_plans.where('user_id').equals(userId).toArray();
    for (const p of all) {
      const active = p.id === id;
      await localDB.diet_plans.update(p.id, { is_active: active });
      await this.runNeonQuery('UPDATE diet_plans SET is_active = $1 WHERE id = $2', [active, p.id]);
    }
  }

  async deleteDietPlan(id) {
    await localDB.diet_plans.delete(id);
    await this.runNeonQuery('DELETE FROM diet_plans WHERE id = $1', [id]);
  }

  // ==========================================
  // DEMO DATA SEEDER
  // ==========================================
  async seedDemoData(userId) {
    const today = new Date();
    const fmt = (d) => d.toISOString().split('T')[0];
    const addDays = (days) => {
      const dt = new Date(today);
      dt.setDate(dt.getDate() + days);
      return fmt(dt);
    };

    // Check if already seeded
    const existingTx = await localDB.transactions.where('user_id').equals(userId).count();
    if (existingTx > 0) return;

    // Seed Transactions
    await this.addTransaction({ userId, amount: 45.50, category: 'food', date: addDays(0), note: 'High-protein lunch bowl' });
    await this.addTransaction({ userId, amount: 18.00, category: 'transport', date: addDays(-1), note: 'Uber cab ride' });
    await this.addTransaction({ userId, amount: 120.00, category: 'shopping', date: addDays(-2), note: 'Gym apparel & resistance bands' });
    await this.addTransaction({ userId, amount: 65.00, category: 'bills', date: addDays(-3), note: 'Monthly internet & electricity' });

    // Seed Subscriptions (with one renewing in 2 days to test the Reminder Alert badge!)
    await this.addSubscription({ userId, name: 'Spotify Premium', amount: 11.99, billingCycle: 'monthly', nextDueDate: addDays(2), remindDays: 3 });
    await this.addSubscription({ userId, name: 'Gold Gym Membership', amount: 49.99, billingCycle: 'monthly', nextDueDate: addDays(12), remindDays: 5 });
    await this.addSubscription({ userId, name: 'Neon Pro Cloud', amount: 19.00, billingCycle: 'monthly', nextDueDate: addDays(25), remindDays: 3 });

    // Seed Tasks
    await this.addTask({ userId, title: 'Complete 45m Leg Day Session', description: 'Focus on deep squats and lunges', dueDate: addDays(0), priority: 'high' });
    await this.addTask({ userId, title: 'Prep clean meal containers for the week', description: 'Chicken breast, quinoa, and broccoli', dueDate: addDays(0), priority: 'medium' });
    await this.addTask({ userId, title: 'Review monthly subscription renewals', description: 'Cancel unused services before auto-bill', dueDate: addDays(1), priority: 'low' });
    await this.addTask({ userId, title: 'Upload new nutritionist diet schedule', description: 'Waiting for macro update sheet', dueDate: addDays(-1), priority: 'high' });

    // Seed Gym Progressive Overload (Bench Press progression across 4 sessions)
    await this.logWorkout({
      userId, date: addDays(-10), exerciseName: 'Bench Press',
      sets: [{ reps: 10, weight: 60 }, { reps: 8, weight: 65 }, { reps: 6, weight: 70 }]
    });
    await this.logWorkout({
      userId, date: addDays(-7), exerciseName: 'Bench Press',
      sets: [{ reps: 10, weight: 62.5 }, { reps: 8, weight: 67.5 }, { reps: 6, weight: 72.5 }]
    });
    await this.logWorkout({
      userId, date: addDays(-4), exerciseName: 'Bench Press',
      sets: [{ reps: 10, weight: 65 }, { reps: 8, weight: 70 }, { reps: 6, weight: 75 }]
    });
    await this.logWorkout({
      userId, date: addDays(-1), exerciseName: 'Bench Press',
      sets: [{ reps: 10, weight: 67.5 }, { reps: 8, weight: 72.5 }, { reps: 6, weight: 77.5 }]
    });

    await this.logWorkout({
      userId, date: addDays(-2), exerciseName: 'Barbell Squat',
      sets: [{ reps: 10, weight: 80 }, { reps: 8, weight: 90 }, { reps: 8, weight: 95 }]
    });

    // Seed Sample Diet Chart SVG converted to data URL
    const svgDiet = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800" fill="%230b0f19"><rect width="600" height="800" rx="20" fill="%23121827"/><text x="300" y="70" fill="%2306b6d4" font-family="sans-serif" font-size="32" font-weight="bold" text-anchor="middle">MACRO & DIET PLAN</text><line x1="50" y1="90" x2="550" y2="90" stroke="%2306b6d4" stroke-width="2"/><text x="60" y="150" fill="%2310b981" font-family="sans-serif" font-size="22" font-weight="bold">BREAKFAST (8:00 AM)</text><text x="60" y="185" fill="%23f1f5f9" font-family="sans-serif" font-size="18">• 3 Whole Eggs + 2 Egg Whites Scrambled</text><text x="60" y="215" fill="%23f1f5f9" font-family="sans-serif" font-size="18">• 60g Rolled Oats with Blueberries & Chia Seeds</text><text x="60" y="290" fill="%2310b981" font-family="sans-serif" font-size="22" font-weight="bold">LUNCH (1:00 PM)</text><text x="60" y="325" fill="%23f1f5f9" font-family="sans-serif" font-size="18">• 200g Grilled Chicken Breast / Tofu</text><text x="60" y="355" fill="%23f1f5f9" font-family="sans-serif" font-size="18">• 150g Cooked Jasmine Rice + Steamed Broccoli</text><text x="60" y="385" fill="%23f1f5f9" font-family="sans-serif" font-size="18">• 1 tbsp Extra Virgin Olive Oil</text><text x="60" y="460" fill="%2310b981" font-family="sans-serif" font-size="22" font-weight="bold">PRE-WORKOUT (4:30 PM)</text><text x="60" y="495" fill="%23f1f5f9" font-family="sans-serif" font-size="18">• 1 Banana + 1 Scoop Whey Protein Isolate</text><text x="60" y="525" fill="%23f1f5f9" font-family="sans-serif" font-size="18">• Black Coffee / Green Tea</text><text x="60" y="600" fill="%2310b981" font-family="sans-serif" font-size="22" font-weight="bold">DINNER (8:30 PM)</text><text x="60" y="635" fill="%23f1f5f9" font-family="sans-serif" font-size="18">• 200g Baked Salmon or Lean Turkey</text><text x="60" y="665" fill="%23f1f5f9" font-family="sans-serif" font-size="18">• Large Green Salad with Avocado & Quinoa</text><rect x="50" y="720" width="500" height="50" rx="10" fill="rgba(6,182,212,0.15)"/><text x="300" y="752" fill="%2306b6d4" font-family="sans-serif" font-size="18" font-weight="bold" text-anchor="middle">Target: 2,450 kcal | 185g Protein | 240g Carbs | 70g Fat</text></svg>`;

    await this.uploadDietPlan({
      userId,
      title: 'High Protein Cutting Plan v2',
      imageData: svgDiet,
      uploadDate: fmt(today),
      isActive: true
    });
  }
}

export const dbService = new DBService();
