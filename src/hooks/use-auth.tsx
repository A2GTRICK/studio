
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth, firebaseConfig } from '@/lib/firebase';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2, ServerCrash } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

// --- IMPORTANT: Define the admin user's email address here ---
const ADMIN_EMAIL = 'admin@example.com';

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

const FirebaseConfigError = () => (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
        <Alert variant="destructive" className="max-w-2xl">
            <ServerCrash className="h-4 w-4" />
            <AlertTitle className="text-xl font-bold">Firebase Configuration Error</AlertTitle>
            <AlertDescription className="mt-2">
                The application cannot connect to Firebase.
                <ol className="mt-4 list-decimal list-inside space-y-2">
                    <li>
                        Ensure you have copied your Firebase project credentials into the <strong>.env</strong> file.
                    </li>
                    <li>
                        After adding the keys, you must <strong>restart the development server</strong> for the changes to take effect.
                    </li>
                     <li>
                        Go to your Firebase Console -> Authentication -> Settings -> Authorized domains and ensure your deployment domain (and 'localhost') is added.
                    </li>
                </ol>
            </AlertDescription>
        </Alert>
    </div>
);


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Check for valid Firebase configuration from .env file
  const isFirebaseConfigured = firebaseConfig.apiKey && firebaseConfig.apiKey !== 'YOUR_API_KEY_HERE';
  if (!isFirebaseConfigured && pathname !== '/login') {
     // Don't render error on login page itself, it has its own
     if(pathname === '/login') {
        // Render children so login page can show its specific error
     } else {
        return <FirebaseConfigError />;
     }
  }


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

    