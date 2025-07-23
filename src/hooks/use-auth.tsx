
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

const loadingMessages = [
    "A2G Smart Notes load ho raha hai... taiyar ho jao!",
    "Unlocking the secrets of pharmacology... 😉",
    "Chai, Sutta, aur A2G Notes... loading...",
    "Just a moment... AI ko gyan prapt ho raha hai!",
    "Welcome! Let's make learning smart and fun."
];

const FullPageSpinner = () => {
    const [message, setMessage] = useState(loadingMessages[0]);

    useEffect(() => {
        const interval = setInterval(() => {
            setMessage(prev => {
                const nextIndex = (loadingMessages.indexOf(prev) + 1) % loadingMessages.length;
                return loadingMessages[nextIndex];
            });
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col justify-center items-center h-screen bg-background">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground animate-pulse">{message}</p>
        </div>
    );
};


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // Only set the user if their email is verified, or if they are a new user who hasn't had a chance to verify yet.
      // This hook will re-run, and on subsequent runs, unverified users will be treated as null.
      if (currentUser && currentUser.emailVerified) {
          setUser(currentUser);
          setIsAdmin(currentUser.email === ADMIN_EMAIL);
      } else {
          setUser(null);
          setIsAdmin(false);
      }
      setLoading(false);
    }, (error) => {
      console.error("Firebase Auth Error:", error);
      setUser(null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

    const isAuthPage = pathname === '/login';
    const isPublicPage = isAuthPage || pathname === '/';
    const isAdminPage = pathname.startsWith('/admin');

    const effectiveUser = auth.currentUser;

    if (effectiveUser && effectiveUser.emailVerified) {
      // User is logged in and verified
      if (isAuthPage) {
        // Redirect from login page to dashboard
        router.push('/dashboard');
      } else if (isAdminPage && effectiveUser.email !== ADMIN_EMAIL) {
        // If a non-admin tries to access an admin page, redirect
        router.push('/dashboard');
      }
    } else {
      // User is not logged in or not verified
      if (!isPublicPage) {
        // Redirect any protected page to the login page
        router.push('/login');
      }
    }

  }, [user, loading, pathname, router]);
  
  const logout = async () => {
      await signOut(auth);
      router.push('/login');
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
