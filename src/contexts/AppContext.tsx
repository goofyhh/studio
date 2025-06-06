
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = "Administrator" | "Supervisor" | "Kiosk";

interface User {
  name: string;
  role: UserRole;
}

interface AppContextType {
  isAuthenticated: boolean;
  user: User | null;
  branch: string | null;
  login: (role: UserRole, identifier?: string) => void;
  logout: () => void;
  setBranch: (branchName: string) => void;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [branch, setBranch] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock loading state from localStorage
    try {
      const storedAuth = localStorage.getItem("timekeeper_auth");
      const storedBranch = localStorage.getItem("timekeeper_branch");
      if (storedAuth) {
        const parsedUser = JSON.parse(storedAuth) as User;
        setUser(parsedUser);
        setIsAuthenticated(true);
      }
      if (storedBranch) {
        setBranch(storedBranch);
      }
    } catch (error) {
      console.error("Failed to load from localStorage", error);
      // Clear potentially corrupted storage
      localStorage.removeItem("timekeeper_auth");
      localStorage.removeItem("timekeeper_branch");
    }
    setIsLoading(false);
  }, []);

  const login = (role: UserRole, identifier?: string) => {
    let userName = "User";
    if (role === "Kiosk") {
      userName = identifier ? `Kiosk User (${identifier})` : "Kiosk Station";
    } else if (role === "Administrator") {
      userName = "admin";
    } else if (role === "Supervisor") {
      userName = "Supervisor User";
    }
    
    const newUser = { name: userName, role };
    setUser(newUser);
    setIsAuthenticated(true);
    try {
      localStorage.setItem("timekeeper_auth", JSON.stringify(newUser));
    } catch (error) {
      console.error("Failed to save auth to localStorage", error);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setBranch(null); // Clear branch state
    try {
      localStorage.removeItem("timekeeper_auth");
      localStorage.removeItem("timekeeper_branch"); // Clear branch from localStorage
    } catch (error) {
      console.error("Failed to clear localStorage", error);
    }
  };

  const selectBranch = (branchName: string) => {
    setBranch(branchName);
    try {
      localStorage.setItem("timekeeper_branch", branchName);
    } catch (error) {
      console.error("Failed to save branch to localStorage", error);
    }
  };

  return (
    <AppContext.Provider value={{ isAuthenticated, user, branch, login, logout, setBranch: selectBranch, isLoading }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

