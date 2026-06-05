import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiveMode, setIsLiveMode] = useState(localStorage.getItem('nexus_is_live') === 'true');
  const [brokerConnected, setBrokerConnected] = useState(false);

  useEffect(() => {
    // Check for saved user ID in local storage
    const savedUserId = localStorage.getItem('nexus_user_id');
    if (savedUserId) {
      fetchUserData(savedUserId);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserData = async (userId) => {
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get(`${API_BASE_URL}/api/auth/me?user_id=${userId}`);
      setUser(res.data.user);
      setProfile(res.data.profile);
      // Only override mode if it's explicitly 'live' in DB and we don't have it locally
      // Or just sync it
      const dbModeIsLive = res.data.user.account_mode === 'live';
      setIsLiveMode(dbModeIsLive);
      localStorage.setItem('nexus_is_live', dbModeIsLive);
      setBrokerConnected(res.data.broker_connected);
    } catch (err) {
      console.error("Failed to fetch user data", err);
      // Fallback for demo frontend mode if backend is unavailable
      if (!err.response) {
        setUser({
          id: userId,
          username: 'NexusUser',
          email: 'user@nexus.ai',
          kyc_status: 'VERIFIED',
          account_mode: localStorage.getItem('nexus_is_live') === 'true' ? 'live' : 'demo'
        });
        setProfile({
          risk_profile: 'MODERATE',
          trading_experience: 'INTERMEDIATE'
        });
        return;
      }
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, { username, password });
      localStorage.setItem('nexus_user_id', res.data.user_id);
      await fetchUserData(res.data.user_id);
      return { success: true };
    } catch (err) {
      // Mock login for offline frontend simulation
      if (!err.response) {
        const dummyId = 'nexus-sim-user';
        localStorage.setItem('nexus_user_id', dummyId);
        await fetchUserData(dummyId);
        return { success: true };
      }
      return { success: false, error: err.response?.data?.detail || `Login failed` };
    }
  };

  const register = async (userData) => {
    try {
      await axios.post(`${API_BASE_URL}/api/auth/register`, userData);
      return { success: true };
    } catch (err) {
      // Mock registration for offline frontend simulation
      if (!err.response) {
        return { success: true };
      }
      return { success: false, error: err.response?.data?.detail || `Registration failed` };
    }
  };

  const logout = () => {
    localStorage.removeItem('nexus_user_id');
    localStorage.removeItem('nexus_is_live');
    setUser(null);
    setProfile(null);
    setIsLiveMode(false);
  };

  const toggleMode = async () => {
    const newMode = isLiveMode ? 'demo' : 'live';
    try {
      await axios.post(`${API_BASE_URL}/api/profile/update?user_id=${user.id}`, {
        account_mode: newMode
      });
      setIsLiveMode(!isLiveMode);
      localStorage.setItem('nexus_is_live', String(!isLiveMode));
      await fetchUserData(user.id);
      return { success: true };
    } catch (err) {
      // Mock toggle for offline frontend simulation
      if (!err.response) {
        setIsLiveMode(!isLiveMode);
        localStorage.setItem('nexus_is_live', String(!isLiveMode));
        if (user) {
          setUser({ ...user, account_mode: newMode });
        }
        return { success: true };
      }
      return { success: false, error: err.response?.data?.detail || "Failed to switch mode" };
    }
  };

  const contextValue = useMemo(() => ({
    user, 
    profile, 
    loading, 
    isLiveMode, 
    brokerConnected, 
    login, 
    register, 
    logout, 
    toggleMode,
    refreshUser: () => {
      if (user?.id) fetchUserData(user.id);
    }
  }), [user, profile, loading, isLiveMode, brokerConnected]);

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};
