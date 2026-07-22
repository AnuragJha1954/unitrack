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
          name: 'Admin User',
          password: 'admin'
        });
      }

      const savedEmail = localStorage.getItem('unitrack_user_email');
      // If no session saved or if session is anything other than admin, user must log in
      if (!savedEmail || savedEmail !== 'admin') {
        localStorage.removeItem('unitrack_user_email');
        setUser(null);
        await loadUserData(null);
        setLoading(false);
        return;
      }

      const found = await dbService.getUser('admin') || adminUser;
      setUser(found);
      await loadUserData(found);
      setLoading(false);
    }
    initAuth();
  }, [loadUserData]);

  const login = async (emailOrUsername, password) => {
    const cleanId = emailOrUsername.trim().toLowerCase();
    
    // For now, strictly only 'admin' username and 'admin' password are authorized
    if (cleanId !== 'admin' || password !== 'admin') {
      throw new Error('Invalid credentials. Authorized username and password are required.');
    }

    let found = await dbService.getUser('admin');
    if (!found) {
      found = await dbService.createUser({ id: 'user_admin', email: 'admin', name: 'Admin User', password: 'admin' });
    }

    localStorage.setItem('unitrack_user_email', 'admin');
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
