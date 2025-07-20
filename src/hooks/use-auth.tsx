
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

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
      console.error("Firebase Auth Error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

    const isAuthPage = pathname === '/login';
    const isPublicPage = isAuthPage || pathname === '/';
    const isAdminPage = pathname.startsWith('/admin');

    if (user) {
      // User is logged in
      if (isAuthPage) {
        // Redirect from login page to dashboard if logged in
        router.push('/dashboard');
      } else if (isAdminPage && !isAdmin) {
        // If a non-admin tries to access an admin page, redirect
        router.push('/dashboard');
      }
    } else {
      // User is not logged in
      if (!isPublicPage) {
        // Redirect any protected page to the login page
        router.push('/login');
      }
    }

  }, [user, loading, pathname, router, isAdmin]);
  
  const logout = async () => {
      await signOut(auth);
  }

  const value = { user, loading, isAdmin, logout };

  const isPublicPage = pathname === '/' || pathname === '/login';
  
  // Show a full-page spinner only for protected routes during the initial auth check.
  // This prevents the login page from flashing on first load for an unauthenticated user.
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
