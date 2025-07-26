
'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface Subscriber {
    id: string;
    email: string;
    subscribedAt: Date;
}

export default function AdminMarketingPage() {
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchSubscribers = useCallback(async () => {
        setLoading(true);
        try {
            const subscribersCollection = collection(db, 'newsletter_subscriptions');
            const q = query(subscribersCollection, orderBy('subscribedAt', 'desc'));
            const subscribersSnapshot = await getDocs(q);
            
            const subscribersList = subscribersSnapshot.docs.map(doc => {
                const data = doc.data();
                const timestamp = data.subscribedAt as Timestamp;
                return { 
                    id: doc.id, 
                    email: data.email,
                    subscribedAt: timestamp.toDate() // Convert Firestore Timestamp to JS Date
                } as Subscriber
            });
            setSubscribers(subscribersList);

        } catch (error) {
            console.error("Error fetching subscribers:", error);
            // Handle error (e.g., show toast)
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSubscribers();
    }, [fetchSubscribers]);

    return (
        <div className="pt-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Newsletter Subscribers</CardTitle>
                    <CardDescription>View all users who subscribed to your newsletter.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-48">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="mt-4 text-muted-foreground">Loading subscribers...</p>
                        </div>
                    ) : subscribers.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Subscription Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {subscribers.map(subscriber => (
                                    <TableRow key={subscriber.id}>
                                        <TableCell className="font-medium">{subscriber.email}</TableCell>
                                        <TableCell>{format(subscriber.subscribedAt, "PPP p")}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="text-center text-muted-foreground py-10">No subscribers yet.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
