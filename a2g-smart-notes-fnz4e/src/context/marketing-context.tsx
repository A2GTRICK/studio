
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore';
import { useAuth } from '@/hooks/use-auth';

export interface MarketingMaterial {
  id: string;
  title: string;
  fileName: string;
  content: string; // This will be a Base64 Data URL
  createdAt: Date;
}

interface MarketingContextType {
  materials: MarketingMaterial[];
  loading: boolean;
  error: string | null;
  addMaterial: (materialData: Omit<MarketingMaterial, 'id' | 'createdAt'>) => Promise<void>;
  deleteMaterial: (materialId: string) => Promise<void>;
}

const MarketingContext = createContext<MarketingContextType | undefined>(undefined);

export function MarketingProvider({ children }: { children: ReactNode }) {
  const [materials, setMaterials] = useState<MarketingMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }
    if (!user) {
        setMaterials([]);
        setLoading(false);
        return;
    }

    setLoading(true);
    const materialsCollection = collection(db, 'marketing_materials');
    const q = query(materialsCollection, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const materialsList = snapshot.docs.map(doc => {
            const data = doc.data();
            const timestamp = data.createdAt as Timestamp;
            return { 
                ...data, 
                id: doc.id,
                createdAt: timestamp ? timestamp.toDate() : new Date() 
            } as MarketingMaterial;
        });
        setMaterials(materialsList);
        setLoading(false);
    }, (err) => {
        console.error("Error fetching marketing materials:", err);
        setError("Could not retrieve marketing materials.");
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user, authLoading]);

  const addMaterial = async (materialData: Omit<MarketingMaterial, 'id' | 'createdAt'>) => {
    try {
      await addDoc(collection(db, 'marketing_materials'), {
        ...materialData,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Error adding marketing material:", err);
      throw err;
    }
  };

  const deleteMaterial = async (materialId: string) => {
    try {
        await deleteDoc(doc(db, 'marketing_materials', materialId));
    } catch (err) {
        console.error("Error deleting material:", err);
        throw err;
    }
  };

  const value = { materials, loading, error, addMaterial, deleteMaterial };

  return (
    <MarketingContext.Provider value={value}>
      {children}
    </MarketingContext.Provider>
  );
}

export function useMarketing() {
  const context = useContext(MarketingContext);
  if (context === undefined) {
    throw new Error('useMarketing must be used within a MarketingProvider');
  }
  return context;
}
