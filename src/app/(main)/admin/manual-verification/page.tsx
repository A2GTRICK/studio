
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, updateDoc, doc, where, Timestamp, serverTimestamp } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, User, CheckCircle, Wrench, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';

interface PaymentRequest {
    productName: string;
    price: string;
    status: 'pending' | 'verified' | 'rejected';
    requestedAt: Timestamp;
}

interface AppUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    paymentRequest?: PaymentRequest;
}

export default function AdminManualVerificationPage() {
    const [users, setUsers] = useState<AppUser[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        setLoading(true);
        const usersCollection = collection(db, 'users');
        const q = query(
            usersCollection, 
            where('paymentRequest', '==', null) // Fetch users with no payment request object
        );
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const usersList = snapshot.docs.map(doc => doc.data() as AppUser);
            setUsers(usersList);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching users for manual verification:", error);
            setLoading(false);
            toast({ title: "Error", description: "Could not fetch users.", variant: "destructive" });
        });

        return () => unsubscribe();
    }, [toast]);

    const handleManualApprove = async (user: AppUser) => {
        try {
             const userRef = doc(db, 'users', user.uid);
             await updateDoc(userRef, {
                 paymentRequest: {
                    productName: "Manually Verified Purchase",
                    price: "N/A",
                    status: "verified",
                    requestedAt: serverTimestamp(),
                    verifiedAt: serverTimestamp()
                 }
             });
             toast({ title: 'User Approved!', description: `${user.displayName} has been manually verified and granted access.`});
        } catch(error) {
             console.error("Error manually approving user:", error);
            toast({ title: "Update Failed", description: "Could not manually approve user.", variant: "destructive" });
        }
    };
    
    const filteredUsers = users.filter(user => 
        user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="pt-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <Wrench/>
                        Manual Verification Failsafe
                    </CardTitle>
                    <CardDescription>
                        This page lists users who have NOT made a verification request through the app. Use this as a backup if a user emails you directly for approval but doesn't appear in the main "Verifications" tab.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <Input 
                            placeholder="Search by name or email to find a user..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-48">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="mt-4 text-muted-foreground">Loading users...</p>
                        </div>
                    ) : filteredUsers.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.map(user => (
                                    <TableRow key={user.uid}>
                                        <TableCell className="font-medium flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                                                <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                                            </Avatar>
                                            {user.displayName || 'N/A'}
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell className="text-right">
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="outline" size="sm">
                                                        <CheckCircle className="mr-2 h-4 w-4" />
                                                        Manually Approve
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive"/>Are you absolutely sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This will manually grant full access to "{user.displayName}" for a purchased item. This action should only be taken after you have independently verified their payment via email. This cannot be easily undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleManualApprove(user)}>
                                                            Yes, grant access
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
                         <div className="flex flex-col items-center justify-center h-48 text-center">
                            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                            <h3 className="text-xl font-semibold">No Unverified Users Found</h3>
                            <p className="text-muted-foreground mt-2">All registered users have a payment status record.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
