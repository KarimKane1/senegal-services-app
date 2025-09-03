import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { mockConnections, Connection, ServiceProvider } from '../data/mockData';

interface User {
  id: string;
  name: string;
  phone: string;
  city: string;
  userType: 'seeker' | 'provider';
  isGuest?: boolean;
  isFirstLogin?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithPhone: (phone: string, password: string, userType: 'seeker' | 'provider') => Promise<void>;
  signup: (data: {
    phone: string;
    password: string;
    name: string;
    city: string;
    userType: 'seeker' | 'provider';
    countryCode: string;
  }) => Promise<void>;
  logout: () => void;
  connections: Connection[];
  availableProviders: ServiceProvider[];
  addConnection: (connection: Connection) => void;
  isGuest: boolean;
  showAuthPrompt: boolean;
  setShowAuthPrompt: (show: boolean) => void;
  promptSignIn: () => void;
  markOnboardingComplete: () => void;
  isFirstLogin: boolean;
  continueAsGuest: (userType: 'seeker' | 'provider') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [availableProviders, setAvailableProviders] = useState<ServiceProvider[]>([]);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [isFirstLogin, setIsFirstLogin] = useState(true);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Mock login - replace with actual authentication
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUser({
        id: '1',
        name: 'John Doe',
        phone: '+1234567890',
        city: 'New York',
        userType: 'seeker'
      });
      setIsFirstLogin(false);
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const loginWithPhone = async (phone: string, password: string, userType: 'seeker' | 'provider') => {
    setLoading(true);
    try {
      // Mock login - replace with actual authentication
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUser({
        id: '1',
        name: userType === 'provider' ? 'John the Plumber' : 'John Doe',
        phone,
        city: 'Dakar',
        userType,
        isFirstLogin: false
      });
      setIsFirstLogin(false);
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (data: {
    phone: string;
    password: string;
    name: string;
    city: string;
    userType: 'seeker' | 'provider';
    countryCode: string;
  }) => {
    setLoading(true);
    try {
      // Mock signup - replace with actual authentication
      await new Promise(resolve => setTimeout(resolve, 1000));
      const fullPhone = `${data.countryCode}${data.phone}`;
      setUser({
        id: Date.now().toString(),
        name: data.name,
        phone: fullPhone,
        city: data.city,
        userType: data.userType,
        isFirstLogin: true
      });
      setIsFirstLogin(true);
    } catch (error) {
      console.error('Signup failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const continueAsGuest = async (userType: 'seeker' | 'provider') => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setUser({
        id: 'guest',
        name: 'Guest User',
        phone: '',
        city: '',
        userType: 'seeker', // Guests are always service seekers
        isGuest: true,
        isFirstLogin: true
      });
      setIsFirstLogin(true);
    } catch (error) {
      console.error('Guest login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setConnections([]);
    setIsFirstLogin(false);
  };

  const addConnection = (connection: Connection) => {
    setConnections(prev => [...prev, connection]);
  };

  const promptSignIn = () => {
    setShowAuthPrompt(true);
  };

  const markOnboardingComplete = () => {
    setIsFirstLogin(false);
  };

  // Fetch providers recommended by user's network connections
  const fetchNetworkProviders = async () => {
    if (!user || user.isGuest) {
      setAvailableProviders([]);
      return;
    }

    try {
      // TODO: Replace with actual API call to fetch providers from user's network
      // For now, return empty array since we want to show only real network recommendations
      setAvailableProviders([]);
    } catch (error) {
      console.error('Failed to fetch network providers:', error);
      setAvailableProviders([]);
    }
  };

  // Fetch providers when user changes
  useEffect(() => {
    fetchNetworkProviders();
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      loginWithPhone,
      signup,
      logout,
      continueAsGuest,
      connections,
      availableProviders,
      addConnection,
      isGuest: user?.isGuest || false,
      showAuthPrompt,
      setShowAuthPrompt,
      promptSignIn,
      markOnboardingComplete,
      isFirstLogin
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}