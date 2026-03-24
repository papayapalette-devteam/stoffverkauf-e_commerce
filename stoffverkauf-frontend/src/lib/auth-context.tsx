import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api from "../../api"; // Axios instance pointing to backend

export interface AuthUser {
  firstName: string;
  lastName: string;
  email: string;
  phone: number;
  address: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (firstName: string, lastName: string, email: string, password: string, agreed: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "weber_auth";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Load user + token from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        setUser(data.user);
        setToken(data.token);
        // Set default axios header
        api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
      }
    } catch {}
  }, []);

  // Save user + token to localStorage
  useEffect(() => {
    if (user && token) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token }));
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      localStorage.removeItem(STORAGE_KEY);
      delete api.defaults.headers.common["Authorization"];
    }
  }, [user, token]);

  const signup = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    agreed: boolean
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.post("/api/user/register-user", { firstName, lastName, email, password, agreed });

      if (res.data.success) {
        const { user: userData, token: jwtToken } = res.data;
        setUser(userData);
        setToken(jwtToken);
        return { success: true };
      } else {
        return { success: false, error: res.data.error || res.data.errors?.[0] };
      }
    } catch (err: any) {
      return { success: false, error: err.response?.data?.error || "server_error" };
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.post("/api/user/login", { email, password });

      if (res.data.success) {
        const { user: userData, token: jwtToken } = res.data;
        setUser(userData);
        setToken(jwtToken);
        return { success: true };
      } else {
        return { success: false, error: res.data.error || "invalid_credentials" };
      }
    } catch (err: any) {
      return { success: false, error: err.response?.data?.error || "server_error" };
    }
  };



  const logout = () => {
    setUser(null);
    setToken(null);
  };

  const updateProfile = (data: Partial<AuthUser>) => {
    if (user) setUser({ ...user, ...data });
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoggedIn: !!user, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};