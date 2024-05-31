"use client";

import React, { createContext, useContext, ReactNode, useState, useEffect } from "react";
import Cookies from "js-cookie";

interface User {
  id: string | null;
  name: string | null;
  email: string | null;
  token: string | null;
  role: "MEMBER" | "ADMIN" | null;
  isLoggedIn: boolean;
  isGmailConnected: boolean;
}

interface AuthContextProps {
  user: User;
  login: (
    id: string,
    name: string,
    token: string,
    email: string,
    role: "MEMBER" | "ADMIN",
    isGmailConnected: boolean
  ) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User>({
    id: null,
    name: null,
    email: null,
    token: null,
    role: null,
    isLoggedIn: false,
    isGmailConnected: false,
  });

  useEffect(() => {
    const storedId = Cookies.get("userId");
    const storedName = Cookies.get("userName");
    const storedEmail = Cookies.get("userEmail");
    const storedToken = Cookies.get("authToken");
    const storedRole = Cookies.get("userRole") as "MEMBER" | "ADMIN" | null;
    const storedIsGmailConnected = Cookies.get("isGmailConnected") === "true";

    if (storedId && storedName && storedEmail && storedToken && storedRole) {
      setUser({
        id: storedId,
        name: storedName,
        email: storedEmail,
        token: storedToken,
        role: storedRole,
        isLoggedIn: true,
        isGmailConnected: storedIsGmailConnected,
      });
    } else {
      setUser({
        id: null,
        name: null,
        email: null,
        token: null,
        role: null,
        isLoggedIn: false,
        isGmailConnected: false,
      });
    }
  }, []);

  const login = (
    id: string,
    name: string,
    email: string,
    token: string,
    role: "MEMBER" | "ADMIN",
    isGmailConnected: boolean
  ) => {
    Cookies.set("userId", id, { expires: 1 });
    Cookies.set("userName", name, { expires: 1 });
    Cookies.set("userEmail", email, { expires: 1 });
    Cookies.set("authToken", token, { expires: 1 });
    Cookies.set("userRole", role, { expires: 1 });
    Cookies.set("isGmailConnected", isGmailConnected ? "true" : "false", { expires: 1 });
    setUser({ id, name, email, token, role, isLoggedIn: true, isGmailConnected });
  };

  const logout = () => {
    Cookies.remove("userId");
    Cookies.remove("userName");
    Cookies.remove("userEmail");
    Cookies.remove("authToken");
    Cookies.remove("userRole");
    Cookies.remove("isGmailConnected");
    setUser({
      id: null,
      name: null,
      email: null,
      token: null,
      role: null,
      isLoggedIn: false,
      isGmailConnected: false,
    });
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
