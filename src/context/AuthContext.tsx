
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from 'sonner';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (pin: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = (pin: string) => {
    // Admin PIN is hardcoded as "8579"
    if (pin === "8579") {
      setIsAuthenticated(true);
      toast.success("Admin login successful");
      return true;
    } else {
      toast.error("Incorrect PIN");
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    toast.info("Logged out successfully");
  };

  const value = {
    isAuthenticated,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
