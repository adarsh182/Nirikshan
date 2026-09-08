import { createContext, useContext, useState, type ReactNode } from "react";
import type { Operator, TokenResponse } from "../types";

export interface ActiveOperator {
  operator_id: string;
  badge_id: string;
  name: string;
  role?: string;
}

interface AuthContextValue {
  token: string | null;
  operator: ActiveOperator | null;
  selectOperator: (op: Operator) => void;
  switchOperator: () => void;
  login: (data: TokenResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token") || localStorage.getItem("operator_id"));
  const [operator, setOperator] = useState<ActiveOperator | null>(() => {
    const stored = localStorage.getItem("operator");
    return stored ? JSON.parse(stored) : null;
  });

  const selectOperator = (op: Operator) => {
    const sessionToken = "session-" + op.id;
    localStorage.setItem("token", sessionToken);
    localStorage.setItem("operator_id", op.id);
    const activeOp: ActiveOperator = {
      operator_id: op.id,
      badge_id: op.badge_id,
      name: op.name,
      role: op.role,
    };
    localStorage.setItem("operator", JSON.stringify(activeOp));
    setToken(sessionToken);
    setOperator(activeOp);
  };

  const switchOperator = () => {
    localStorage.removeItem("operator_id");
    localStorage.removeItem("operator");
    localStorage.removeItem("token");
    setToken(null);
    setOperator(null);
  };

  const login = (data: TokenResponse) => {
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("operator_id", data.operator_id);
    const op: ActiveOperator = {
      operator_id: data.operator_id,
      badge_id: data.badge_id,
      name: data.name,
    };
    localStorage.setItem("operator", JSON.stringify(op));
    setToken(data.access_token);
    setOperator(op);
  };

  const logout = () => {
    switchOperator();
  };

  return (
    <AuthContext.Provider value={{ token, operator, selectOperator, switchOperator, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
