
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// --- Hardcoded Admin User ID ---
const ADMIN_UID = 'sRiwSuQlxgbGRUcO7CevaJxQBEq2';
// -----------------------------

interface PaymentRequest {
    productName: string;
    price: string;
    status: 'pending' | 'verified' | 'rejected';
    requestedAt: Timestamp;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  hasPremiumAccess: boolean;
  paymentInfo: PaymentRequest | null;
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
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<PaymentRequest | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser && currentUser.emailVerified) {
          setUser(currentUser);
          const isAdminUser = currentUser.uid === ADMIN_UID;
          setIsAdmin(isAdminUser);

          // Check for premium access
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
              const userData = userDoc.data();
              const paymentData = userData?.paymentRequest;
              if (paymentData?.status === 'verified') {
                 setHasPremiumAccess(true);
                 setPaymentInfo(paymentData as PaymentRequest);
              } else {
                 setHasPremiumAccess(isAdminUser);
                 setPaymentInfo(null);
              }
          } else {
              // Also consider admin as having premium access
              setHasPremiumAccess(isAdminUser);
              setPaymentInfo(null);
          }
      } else {
          setUser(null);
          setIsAdmin(false);
          setHasPremiumAccess(false);
          setPaymentInfo(null);
      }
      setLoading(false);
    }, (error) => {
      console.error("Firebase Auth Error:", error);
      setUser(null);
      setIsAdmin(false);
      setHasPremiumAccess(false);
      setPaymentInfo(null);
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
      if (isAuthPage) {
        router.push('/dashboard');
      } else if (isAdminPage && !isAdmin) {
        console.warn("Non-admin user attempted to access admin page. Redirecting.");
        router.push('/dashboard');
      }
    } else {
      if (!isPublicPage) {
        router.push('/login');
      }
    }

  }, [user, isAdmin, loading, pathname, router]);
  
  const logout = async () => {
      await signOut(auth);
      router.push('/login');
  }

  const value = { user, loading, isAdmin, hasPremiumAccess, paymentInfo, logout };

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
