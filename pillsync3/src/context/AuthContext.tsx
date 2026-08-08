import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { User } from "@/types";
import { authApi, storage } from "@/api";

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  guest: () => Promise<void>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(storage.loadUser());
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const { token, user } = await authApi.login(email, password);
    storage.saveSession(token, user);
    setUser(user);
  };
  const register = async (name: string, email: string, password: string) => {
    const { token, user } = await authApi.register(name, email, password);
    storage.saveSession(token, user);
    setUser(user);
  };
  const guest = async () => {
    const { token, user } = await authApi.guest();
    storage.saveSession(token, user);
    setUser(user);
  };
  const logout = () => {
    storage.clear();
    setUser(null);
  };

  return (
    <Ctx.Provider value={{ user, loading, login, register, guest, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  return useContext(Ctx);
}
