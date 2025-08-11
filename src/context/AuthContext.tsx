import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js';

import { supabaseClient } from '../lib/supabaseClient';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Load session on mount
  useEffect(() => {
    const getInitialSession = async () => {
      const { data } = await supabaseClient.auth.getSession();
      setSession(data.session);
      setUser(data.session?.user ?? null);
    };
    getInitialSession();

    // Listen for auth changes
    const { data: listener } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabaseClient.auth.signUp({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, session, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook for consuming auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};