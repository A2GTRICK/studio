
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, orderBy, Timestamp, deleteDoc, doc } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Trash2, MoreHorizontal, Download, Save } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { leadMagnetPath } from '@/config/marketing';


interface Subscriber {
    id: string;
    email: string;
    subscribedAt: Date;
}

const LeadMagnetManager = () => {
    const { toast } = useToast();
    const [newPath, setNewPath] = useState(leadMagnetPath);

    const handleUpdatePath = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real application, this would update a config file on the server or a value in the database.
        // For this prototype, we'll just show a success message to simulate the action.
        toast({
            title: "Action Required!",
            description: "To change the lead magnet file, please update the path in src/config/marketing.ts",
            duration: 8000,
        });
    };
    
    return (
        <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
                <CardTitle className="font-headline">Manage Lead Magnet</CardTitle>
                <CardDescription>
                    This is the file users will receive when they subscribe to your newsletter. To change it, update the file path below.
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleUpdatePath}>
                <CardContent className="space-y-4">
                     <div>
                        <Label htmlFor="current-path">Current File Path</Label>
                        <div className="flex gap-2 items-center">
                            <Input id="current-path" value={newPath} onChange={(e) => setNewPath(e.target.value)} />
                            <Button variant="secondary" asChild>
                                <a href={newPath} target="_blank" rel="noopener noreferrer" >
                                    <Download className="h-4 w-4" />
                                </a>
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">To change the file, upload a new one to the `public/assets` folder and update this path.</p>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit">
                        <Save className="mr-2 h-4 w-4" /> Save New Path
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}


export default function AdminMarketingPage() {
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [loading, setLoading] = useState(true);
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
        <div className="pt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Newsletter Subscribers</CardTitle>
                        <CardDescription>
                          A list of all users who have subscribed. A total of {subscribers.length} {subscribers.length === 1 ? 'user has' : 'users have'} subscribed.
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
            <div className="lg:col-span-1">
                <LeadMagnetManager />
            </div>
        </div>
    );
}
