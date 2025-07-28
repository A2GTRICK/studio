
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, orderBy, Timestamp, deleteDoc, doc } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Trash2, MoreHorizontal, Save, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { getLeadMagnetPath, updateLeadMagnetPath } from '@/services/marketing-service';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';


interface Subscriber {
    id: string;
    email: string;
    subscribedAt: Date;
}

const LeadMagnetManager = () => {
    const { toast } = useToast();
    const [currentPath, setCurrentPath] = useState('');
    const [newPath, setNewPath] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPath = async () => {
            try {
                setLoading(true);
                setError(null);
                const path = await getLeadMagnetPath();
                setCurrentPath(path);
                setNewPath(path);
            } catch (err: any) {
                console.error("Error fetching lead magnet path:", err);
                setError(err.message || "Could not load the current lead magnet path from the database.");
            } finally {
                setLoading(false);
            }
        };
        fetchPath();
    }, []);

    const handleUpdatePath = async () => {
        setIsSubmitting(true);
        setError(null);
        try {
            await updateLeadMagnetPath(newPath);
            setCurrentPath(newPath);
            toast({
                title: "Success!",
                description: "The lead magnet path has been updated successfully.",
            });
        } catch (err: any) {
            console.error("Error updating lead magnet path:", err);
            setError(err.message || "An unknown error occurred while saving the path.");
            toast({
                title: "Update Failed",
                description: err.message || "Could not save the new path to the database.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
                <CardTitle className="font-headline">Manage Lead Magnet</CardTitle>
                <CardDescription>
                    This is the file users receive when they subscribe. Paste a public URL (e.g., from Google Drive) below and save.
                </CardDescription>
            </CardHeader>
             <CardContent className="space-y-4">
                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                {loading ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Loading current path...</span>
                    </div>
                ) : (
                    <>
                    <div>
                        <Label htmlFor="current-path">Current File URL</Label>
                        <Input id="current-path" value={currentPath} readOnly disabled className="text-xs" />
                    </div>
                    <div>
                        <Label htmlFor="new-path">New File URL</Label>
                        <div className="relative">
                             <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                             <Input 
                                id="new-path" 
                                value={newPath} 
                                onChange={(e) => setNewPath(e.target.value)}
                                placeholder="https://example.com/file.pdf"
                                className="pl-10"
                                disabled={isSubmitting}
                             />
                        </div>
                    </div>
                    </>
                )}
            </CardContent>
            <CardFooter>
                 <Button className="w-full" onClick={handleUpdatePath} disabled={loading || isSubmitting || newPath === currentPath}>
                    {isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="mr-2 h-4 w-4" />
                    )}
                    {isSubmitting ? "Saving..." : "Save New Path"}
                </Button>
            </CardFooter>
        </Card>
    );
};


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
                                                            </Description>
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
