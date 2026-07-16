import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

import type { User } from "../types/user";

import {
  getUser,
  isAuthenticated,
} from "../utils/auth";

interface AuthContextType {
  authenticated: boolean;
  user: User | null;
  setUser: (user: User | null) => void;
  setAuthenticated: (value: boolean) => void;
}

const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  );

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] =
     useState<User | null>(getUser());

  const [authenticated, setAuthenticated] =
     useState(isAuthenticated());

  return (
    <AuthContext.Provider
     value={{
     authenticated,
     setAuthenticated,
     user,
     setUser,
     }}
     >
     {children}
     </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider."
    );
  }

  return context;
}