import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface AuthUser {
  firstName: string;
  lastName: string;
  email: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  signup: (firstName: string, lastName: string, email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  updateProfile: (data: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "weber_auth_user";
const USERS_KEY = "weber_registered_users";

interface StoredUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const getUsers = (): StoredUser[] => {
    try {
      const stored = localStorage.getItem(USERS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveUsers = (users: StoredUser[]) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  };

  const signup = (firstName: string, lastName: string, email: string, password: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!firstName.trim() || !lastName.trim()) return { success: false, error: "name_required" };
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) return { success: false, error: "invalid_email" };
    if (password.length < 6) return { success: false, error: "password_short" };

    const users = getUsers();
    if (users.find((u) => u.email === trimmedEmail)) return { success: false, error: "email_exists" };

    const newUser: StoredUser = { firstName: firstName.trim(), lastName: lastName.trim(), email: trimmedEmail, password };
    saveUsers([...users, newUser]);
    setUser({ firstName: newUser.firstName, lastName: newUser.lastName, email: newUser.email });
    return { success: true };
  };

  const login = (email: string, password: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) return { success: false, error: "invalid_email" };

    const users = getUsers();
    const found = users.find((u) => u.email === trimmedEmail && u.password === password);
    if (!found) return { success: false, error: "invalid_credentials" };

    setUser({ firstName: found.firstName, lastName: found.lastName, email: found.email });
    return { success: true };
  };

  const logout = () => setUser(null);

  const updateProfile = (data: Partial<AuthUser>) => {
    if (user) setUser({ ...user, ...data });
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
