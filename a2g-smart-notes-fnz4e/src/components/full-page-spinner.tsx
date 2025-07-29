
'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const loadingMessages = [
    "A2G Smart Notes load ho raha hai... taiyar ho jao!",
    "Unlocking the secrets of pharmacology... 😉",
    "Chai, Sutta, aur A2G Notes... loading...",
    "Just a moment... AI ko gyan prapt ho raha hai!",
    "Welcome! Let's make learning smart and fun."
];

export const FullPageSpinner = () => {
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
