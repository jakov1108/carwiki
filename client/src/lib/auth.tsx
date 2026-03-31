import { createContext, useContext, ReactNode } from "react";
import { authClient } from "./auth-client";
import type { SafeUser } from "../../../shared/auth-schema";

interface AuthContextType {
  user: SafeUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending: isLoading } = authClient.useSession();

  const login = async (email: string, password: string) => {
    const result = await authClient.signIn.email({
      email,
      password,
    });
    
    if (result.error) {
      throw new Error(result.error.message || "Prijava neuspješna");
    }
  };

  const register = async (email: string, password: string, name: string) => {
    const result = await authClient.signUp.email({
      email,
      password,
      name,
    });
    
    if (result.error) {
      throw new Error(result.error.message || "Registracija neuspješna");
    }
    
    // Return success so we can show verification message
    return result;
  };

  const logout = async () => {
    await authClient.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user: session?.user as SafeUser | null,
        login,
        register,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
