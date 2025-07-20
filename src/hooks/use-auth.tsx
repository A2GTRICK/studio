
'use client';

import React from 'react';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// The admin email is now sourced from an environment variable for security and flexibility.
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const FullPageSpinner = () => (
    <div className="flex justify-center items-center h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAdmin(currentUser?.email === ADMIN_EMAIL);
      setLoading(false);
    }, (error) => {
      // Catch potential auth errors (like config issues) during initialization
      console.error("Firebase Auth Error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

    const isAuthPage = pathname === '/login';
    const isLandingPage = pathname === '/';
    const isAdminPage = pathname.startsWith('/admin');

    // If user is logged in, redirect from login page to dashboard
    if (user && isAuthPage) {
      router.push('/dashboard');
      return;
    }

    // If user is NOT logged in, redirect any protected page to login
    if (!user && !isAuthPage && !isLandingPage) {
      router.push('/login');
      return;
    }
      
    // If a non-admin tries to access an admin page, redirect them
    if (user && !isAdmin && isAdminPage) {
        router.push('/dashboard');
        return;
    }

  }, [user, loading, pathname, router, isAdmin]);
  
  const logout = async () => {
      await signOut(auth);
      // Let the onAuthStateChanged listener handle state updates
  }

  const value = { user, loading, isAdmin, logout };

  const isPublicPage = pathname === '/' || pathname === '/login';

  if (loading && !isPublicPage) {
    return <FullPageSpinner />;
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
