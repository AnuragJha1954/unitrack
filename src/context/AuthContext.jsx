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
      const savedEmail = localStorage.getItem('unitrack_user_email');
      if (savedEmail) {
        const found = await dbService.getUser(savedEmail);
        if (found) {
          setUser(found);
          await loadUserData(found);
          setLoading(false);
          return;
        }
      }

      // Auto-initialize demo guest user so user sees rich UI right out of the box
      const demoEmail = 'guest.tracker@unitrack.app';
      let demoUser = await dbService.getUser(demoEmail);
      if (!demoUser) {
        demoUser = await dbService.createUser({
          email: demoEmail,
          name: 'Alex Rivera (Demo)',
          password: ''
        });
      }
      localStorage.setItem('unitrack_user_email', demoUser.email);
      setUser(demoUser);
      await loadUserData(demoUser);
      setLoading(false);
    }
    initAuth();
  }, [loadUserData]);

  const login = async (email, password) => {
    let found = await dbService.getUser(email);
    if (!found) {
      // Create account if not exists during quick login
      found = await dbService.createUser({ email, name: email.split('@')[0], password });
    }
    localStorage.setItem('unitrack_user_email', found.email);
    setUser(found);
    await loadUserData(found);
    return found;
  };

  const signup = async (name, email, password) => {
    const newUser = await dbService.createUser({ email, name, password });
    localStorage.setItem('unitrack_user_email', newUser.email);
    setUser(newUser);
    await loadUserData(newUser);
    return newUser;
  };

  const logout = async () => {
    localStorage.removeItem('unitrack_user_email');
    const demoEmail = 'guest.tracker@unitrack.app';
    let demoUser = await dbService.getUser(demoEmail);
    if (demoUser) {
      setUser(demoUser);
      await loadUserData(demoUser);
    } else {
      setUser(null);
    }
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
