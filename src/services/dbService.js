import Dexie from 'dexie';
import { compressImageToWebP } from '../utils/imageCompressor';
import { imgbbService } from './imgbbService';

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

    return newUser;
  }

  async purgeDemoAndClean() {
    try {
      const demoEmails = ['guest.tracker@unitrack.app'];
      const allUsers = await localDB.users.toArray();
      const demoUsers = allUsers.filter(u => 
        demoEmails.includes(u.email) || 
        u.name?.includes('Demo') || 
        u.name?.includes('Alex') || 
        u.id?.includes('demo') || 
        u.email?.includes('guest')
      );

      const demoUserIds = demoUsers.map(u => u.id);
      if (demoUserIds.length > 0) {
        for (const uid of demoUserIds) {
          await localDB.transactions.where('user_id').equals(uid).delete();
          await localDB.subscriptions.where('user_id').equals(uid).delete();
          await localDB.tasks.where('user_id').equals(uid).delete();
          await localDB.workouts.where('user_id').equals(uid).delete();
          await localDB.diet_plans.where('user_id').equals(uid).delete();
          await localDB.users.delete(uid);

          await this.runNeonQuery('DELETE FROM transactions WHERE user_id = $1', [uid]);
          await this.runNeonQuery('DELETE FROM subscriptions WHERE user_id = $1', [uid]);
          await this.runNeonQuery('DELETE FROM tasks WHERE user_id = $1', [uid]);
          await this.runNeonQuery('DELETE FROM workouts WHERE user_id = $1', [uid]);
          await this.runNeonQuery('DELETE FROM diet_plans WHERE user_id = $1', [uid]);
          await this.runNeonQuery('DELETE FROM users WHERE id = $1', [uid]);
        }
      }
    } catch (e) {
      console.warn('Purge error:', e);
    }
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

    // Automatically compress to ultra-lightweight WebP (~10-15KB) and optionally upload to free ImgBB external cloud
    const compressedImage = await compressImageToWebP(imageData, 600, 600, 0.65);
    const finalImageUrlOrData = await imgbbService.uploadImage(compressedImage);

    const plan = {
      id: 'dpl_' + Date.now() + Math.random().toString(36).substr(2, 5),
      user_id: userId,
      title: title || 'Diet Chart ' + new Date().toLocaleDateString(),
      image_data: finalImageUrlOrData,
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

  /**
   * Calculates estimated byte size and percentage used of the 512 MB Neon Postgres quota.
   */
  async calculateStorageUsage() {
    try {
      const users = await localDB.users.toArray();
      const transactions = await localDB.transactions.toArray();
      const subscriptions = await localDB.subscriptions.toArray();
      const tasks = await localDB.tasks.toArray();
      const workouts = await localDB.workouts.toArray();
      const dietPlans = await localDB.diet_plans.toArray();

      const calcSize = (arr) => JSON.stringify(arr || []).length;
      const breakdown = {
        users: { count: users.length, bytes: calcSize(users) },
        transactions: { count: transactions.length, bytes: calcSize(transactions) },
        subscriptions: { count: subscriptions.length, bytes: calcSize(subscriptions) },
        tasks: { count: tasks.length, bytes: calcSize(tasks) },
        workouts: { count: workouts.length, bytes: calcSize(workouts) },
        diet_plans: { count: dietPlans.length, bytes: calcSize(dietPlans) }
      };

      const totalBytes = Object.values(breakdown).reduce((acc, curr) => acc + curr.bytes, 0);
      const totalMB = (totalBytes / (1024 * 1024)).toFixed(3);
      const percentage = ((totalBytes / (512 * 1024 * 1024)) * 100).toFixed(3);

      return {
        totalBytes,
        totalMB,
        maxMB: 512,
        percentage,
        breakdown
      };
    } catch (err) {
      console.warn('Storage calculation error:', err);
      return { totalBytes: 0, totalMB: '0.000', maxMB: 512, percentage: '0.000', breakdown: {} };
    }
  }

  /**
   * Cleans up old inactive tasks and archived photos to reclaim DB space.
   */
  async compactAndCleanupStorage(userId) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 30); // 30 days ago
      const cutoffStr = cutoffDate.toISOString().split('T')[0];

      // Delete completed tasks older than 30 days
      const oldTasks = await localDB.tasks.where('user_id').equals(userId).toArray();
      let removedTasks = 0;
      for (const t of oldTasks) {
        if (t.completed && t.due_date < cutoffStr) {
          await localDB.tasks.delete(t.id);
          await this.runNeonQuery('DELETE FROM tasks WHERE id = $1', [t.id]);
          removedTasks++;
        }
      }

      return { removedTasks, success: true };
    } catch (err) {
      console.warn('Cleanup error:', err);
      return { removedTasks: 0, success: false, error: err.message };
    }
  }

}

export const dbService = new DBService();
