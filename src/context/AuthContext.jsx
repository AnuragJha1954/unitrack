import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { dbService } from '../services/dbService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [neonSettings, setNeonSettings] = useState(dbService.getNeonSettings());
  
  // App state loaded from database
  const [transactions, setTransactions] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [dietPlans, setDietPlans] = useState([]);
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'finance', 'tasks', 'gym', 'diet'

  const loadUserData = useCallback(async (currentUser) => {
    if (!currentUser) {
      setTransactions([]);
      setSubscriptions([]);
      setTasks([]);
      setWorkouts([]);
      setDietPlans([]);
      return;
    }

    try {
      const [txList, subList, taskList, wktList, dietList] = await Promise.all([
        dbService.getTransactions(currentUser.id),
        dbService.getSubscriptions(currentUser.id),
        dbService.getTasks(currentUser.id),
        dbService.getWorkouts(currentUser.id),
        dbService.getDietPlans(currentUser.id)
      ]);
      setTransactions(txList || []);
      setSubscriptions(subList || []);
      setTasks(taskList || []);
      setWorkouts(wktList || []);
      setDietPlans(dietList || []);
    } catch (err) {
      console.error('Error loading module data:', err);
    }
  }, []);

  useEffect(() => {
    async function initAuth() {
      setLoading(true);
      // Purge any residual demo/Alex records from local IndexedDB & Neon
      await dbService.purgeDemoAndClean();

      // Ensure default admin user exists
      let adminUser = await dbService.getUser('admin');
      if (!adminUser) {
        adminUser = await dbService.createUser({
          id: 'user_admin',
          email: 'admin',
          name: 'Admin',
          password: 'admin'
        });
      }

      let savedEmail = localStorage.getItem('unitrack_user_email');
      // If old demo user (guest/Alex) is saved in localStorage or if no account is saved, default to clean Admin account
      if (!savedEmail || savedEmail === 'guest.tracker@unitrack.app' || savedEmail.toLowerCase().includes('guest') || savedEmail.toLowerCase().includes('alex')) {
        savedEmail = 'admin';
        localStorage.setItem('unitrack_user_email', 'admin');
      }

      const found = await dbService.getUser(savedEmail);
      if (found) {
        setUser(found);
        await loadUserData(found);
        setLoading(false);
        return;
      }

      setUser(adminUser);
      await loadUserData(adminUser);
      setLoading(false);
    }
    initAuth();
  }, [loadUserData]);

  const login = async (emailOrUsername, password) => {
    const cleanId = emailOrUsername.trim().toLowerCase();
    let found = await dbService.getUser(cleanId);

    if (!found) {
      if (cleanId === 'admin' && password === 'admin') {
        found = await dbService.createUser({ id: 'user_admin', email: 'admin', name: 'Admin', password: 'admin' });
      } else {
        found = await dbService.createUser({ email: cleanId, name: cleanId.split('@')[0], password });
      }
    } else if (cleanId === 'admin' && password !== 'admin') {
      throw new Error('Invalid password for admin account.');
    } else if (found.password_hash && password && found.password_hash !== password) {
      throw new Error('Incorrect password.');
    }

    localStorage.setItem('unitrack_user_email', found.email);
    setUser(found);
    await loadUserData(found);
    return found;
  };

  const signup = async (name, email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    const newUser = await dbService.createUser({ email: cleanEmail, name, password });
    localStorage.setItem('unitrack_user_email', newUser.email);
    setUser(newUser);
    await loadUserData(newUser);
    return newUser;
  };

  const logout = async () => {
    localStorage.removeItem('unitrack_user_email');
    setUser(null);
    await loadUserData(null);
  };

  const updateNeonConfig = async (url, enabled) => {
    dbService.setNeonConnection(url, enabled);
    setNeonSettings(dbService.getNeonSettings());
    if (enabled && url) {
      await dbService.setupNeonTables().catch(() => {});
    }
    if (user) await loadUserData(user);
  };

  const refreshAll = useCallback(async () => {
    if (user) await loadUserData(user);
  }, [user, loadUserData]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        neonSettings,
        updateNeonConfig,
        login,
        signup,
        logout,
        transactions,
        subscriptions,
        tasks,
        workouts,
        dietPlans,
        refreshAll,
        activeTab,
        setActiveTab
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
