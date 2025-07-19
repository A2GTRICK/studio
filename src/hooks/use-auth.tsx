
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return; // Don't do anything while loading

    const isAuthPage = pathname === '/login';
    const isLandingPage = pathname === '/';

    // If the user is logged in and tries to access the login page, redirect to dashboard
    if (user && isAuthPage) {
      router.push('/dashboard');
    }

    // If the user is not logged in and tries to access a protected page, redirect to login
    if (!user && !isAuthPage && !isLandingPage) {
      router.push('/login');
    }
  }, [user, loading, pathname, router]);
  
  const logout = async () => {
      await signOut(auth);
      setUser(null);
  }

  const value = {
    user,
    loading,
    logout,
  };

  const isAuthPage = pathname === '/login';
  const isLandingPage = pathname === '/';

  // Show a global loading spinner for protected pages while auth state is resolving
  if (loading && !isAuthPage && !isLandingPage) {
    return (
        <div className="flex justify-center items-center h-screen">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
        </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
