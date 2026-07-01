import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getSession, signIn, signOut, signUp } from "@/lib/api";
import type { EmailSignupResult, User } from "@/lib/types";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  refreshSession: () => Promise<void>;
  logInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (displayName: string, email: string, password: string) => Promise<EmailSignupResult>;
  logOut: () => Promise<void>;
  logInWithGoogle: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    const { user: sessionUser } = await getSession();
    setUser(sessionUser);
  }, []);

  useEffect(() => {
    refreshSession()
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [refreshSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      refreshSession,
      async logInWithEmail(email, password) {
        const { user: sessionUser } = await signIn({ email, password });
        setUser(sessionUser);
      },
      async signUpWithEmail(displayName, email, password) {
        return signUp({ displayName, email, password });
      },
      async logOut() {
        await signOut();
        setUser(null);
      },
      logInWithGoogle() {
        window.location.href = "/api/auth/google";
      },
    }),
    [loading, refreshSession, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }
  return context;
}
