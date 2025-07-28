
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, updateDoc, doc, where, orderBy, Timestamp } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, User, CheckCircle, XCircle, MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


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
    paymentRequest: PaymentRequest;
}

export default function AdminVerificationsPage() {
    const [requests, setRequests] = useState<AppUser[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        setLoading(true);
        const usersCollection = collection(db, 'users');
        const q = query(
            usersCollection, 
            where('paymentRequest.status', '==', 'pending'),
            orderBy('paymentRequest.requestedAt', 'desc')
        );
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const requestsList = snapshot.docs.map(doc => doc.data() as AppUser);
            setRequests(requestsList);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching verification requests:", error);
            setLoading(false);
            toast({ title: "Error", description: "Could not fetch payment requests.", variant: "destructive" });
        });

        return () => unsubscribe();
    }, [toast]);
    
    const handlePaymentAction = async (user: AppUser, status: 'verified' | 'rejected') => {
        if (!user.paymentRequest) return;
        
        try {
             const userRef = doc(db, 'users', user.uid);
             await updateDoc(userRef, {
                 'paymentRequest.status': status
             });
             toast({ title: 'Payment Status Updated', description: `Request for ${user.displayName} marked as ${status}.`});
        } catch(error) {
             console.error("Error updating payment status:", error);
            toast({ title: "Update Failed", description: "Could not update payment status.", variant: "destructive" });
        }
    }


    return (
        <div className="pt-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Payment Verification Requests</CardTitle>
                    <CardDescription>Approve or reject pending payment verification requests from users.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-48">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="mt-4 text-muted-foreground">Loading pending requests...</p>
                        </div>
                    ) : requests.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Requested At</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {requests.map(user => (
                                    <TableRow key={user.uid}>
                                        <TableCell className="font-medium flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                                                <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p>{user.displayName || 'N/A'}</p>
                                                <p className="text-xs text-muted-foreground">{user.email}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <p className="font-semibold">{user.paymentRequest.productName}</p>
                                            <Badge variant="secondary">{user.paymentRequest.price}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            {format(user.paymentRequest.requestedAt.toDate(), "PPP p")}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        <span className="sr-only">Actions</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Verification</DropdownMenuLabel>
                                                    <DropdownMenuItem className="text-green-600 focus:text-green-700" onClick={() => handlePaymentAction(user, 'verified')}>
                                                        <CheckCircle className="mr-2 h-4 w-4" />
                                                        Approve Payment
                                                    </DropdownMenuItem>
                                                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handlePaymentAction(user, 'rejected')}>
                                                        <XCircle className="mr-2 h-4 w-4" />
                                                        Reject Payment
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                         <div className="flex flex-col items-center justify-center h-48 text-center">
                            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                            <h3 className="text-xl font-semibold">All Caught Up!</h3>
                            <p className="text-muted-foreground mt-2">There are no pending payment verifications right now.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
