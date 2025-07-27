
'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, Timestamp, addDoc, serverTimestamp, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Trash2, PlusCircle, MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Subscriber {
    id: string;
    email: string;
    subscribedAt: Date;
}

export default function AdminMarketingPage() {
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const subscribersCollection = collection(db, 'newsletter_subscriptions');
        const q = query(subscribersCollection, orderBy('subscribedAt', 'desc'));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const subscribersList = snapshot.docs.map(doc => {
                const data = doc.data();
                const timestamp = data.subscribedAt as Timestamp;
                return { 
                    id: doc.id, 
                    email: data.email,
                    subscribedAt: timestamp ? timestamp.toDate() : new Date()
                } as Subscriber;
            });
            setSubscribers(subscribersList);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching subscribers:", error);
            toast({ title: "Error", description: "Could not fetch subscribers.", variant: "destructive" });
            setLoading(false);
        });

        return () => unsubscribe();
    }, [toast]);


    const handleAddSubscriber = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        const form = e.currentTarget;
        const formData = new FormData(form);
        const email = formData.get('email') as string;

        if (!email) {
            toast({ title: "Email required", description: "Please enter an email address.", variant: "destructive"});
            setIsSubmitting(false);
            return;
        }

        try {
            await addDoc(collection(db, 'newsletter_subscriptions'), {
                email,
                subscribedAt: serverTimestamp(),
            });
            toast({ title: "Success!", description: `${email} has been added to the newsletter list.`});
            form.reset();
        } catch (error) {
            console.error("Error adding subscriber:", error);
            toast({ title: "Error", description: "Could not add subscriber.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleDeleteSubscriber = async (subscriberId: string) => {
        try {
            await deleteDoc(doc(db, 'newsletter_subscriptions', subscriberId));
            toast({ title: "Subscriber Deleted", description: "The email has been removed from the list.", variant: "destructive" });
        } catch (error) {
            console.error("Error deleting subscriber:", error);
            toast({ title: "Error", description: "Could not delete subscriber.", variant: "destructive" });
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start pt-6">
            <div className="lg:col-span-1">
                <form onSubmit={handleAddSubscriber}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline flex items-center gap-2">
                                <PlusCircle /> Add Subscriber
                            </CardTitle>
                            <CardDescription>Manually add an email to your newsletter list.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" name="email" type="email" placeholder="student@example.com" required disabled={isSubmitting} />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                                {isSubmitting ? 'Adding...' : 'Add Subscriber'}
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Newsletter Subscribers</CardTitle>
                        <CardDescription>
                          A total of {subscribers.length} {subscribers.length === 1 ? 'user has' : 'users have'} subscribed.
                        </CardDescription>
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
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {subscribers.map(subscriber => (
                                        <TableRow key={subscriber.id}>
                                            <TableCell className="font-medium">{subscriber.email}</TableCell>
                                            <TableCell>{subscriber.subscribedAt ? format(subscriber.subscribedAt, "PPP p") : 'Just now'}</TableCell>
                                            <TableCell className="text-right">
                                                <AlertDialog>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                                <span className="sr-only">Actions</span>
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <AlertDialogTrigger asChild>
                                                                <DropdownMenuItem className="text-destructive focus:text-destructive">
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </AlertDialogTrigger>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This will permanently delete the subscriber "{subscriber.email}". This action cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeleteSubscriber(subscriber.id)} className="bg-destructive hover:bg-destructive/90">
                                                                Yes, delete subscriber
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </TableCell>
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
        </div>
    );
}
