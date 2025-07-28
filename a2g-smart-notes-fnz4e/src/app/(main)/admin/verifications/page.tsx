
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, Timestamp, getDoc } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, MoreHorizontal, CheckCircle, XCircle, AlertCircle, User } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserInfo {
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
}

interface VerificationRequest {
    id: string;
    uid: string;
    userInfo?: UserInfo;
    productName: string;
    price: string;
    status: 'pending' | 'verified' | 'rejected';
    createdAt: Date;
}

const getStatusVariant = (status: VerificationRequest['status']) => {
    switch (status) {
        case 'verified': return 'default';
        case 'pending': return 'secondary';
        case 'rejected': return 'destructive';
        default: return 'outline';
    }
}

const getStatusIcon = (status: VerificationRequest['status']) => {
    switch (status) {
        case 'verified': return <CheckCircle className="h-4 w-4 text-green-500" />;
        case 'pending': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
        case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
        default: return null;
    }
}

// A simple cache for user data to avoid re-fetching on every render
const userCache = new Map<string, UserInfo>();

const fetchUserInfo = async (uid: string): Promise<UserInfo | null> => {
    if (userCache.has(uid)) {
        return userCache.get(uid)!;
    }
    try {
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            const userData = userSnap.data() as UserInfo;
            userCache.set(uid, userData);
            return userData;
        }
        return null;
    } catch (error) {
        console.error("Error fetching user info:", error);
        return null;
    }
};


export default function AdminVerificationsPage() {
    const [requests, setRequests] = useState<VerificationRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const verificationsCollection = collection(db, 'payment_verifications');
        const q = query(verificationsCollection, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            setLoading(true);
            const requestsListPromises = snapshot.docs.map(async (docSnapshot) => {
                const data = docSnapshot.data();
                const timestamp = data.createdAt as Timestamp;
                const userInfo = await fetchUserInfo(data.uid);
                
                return {
                    id: docSnapshot.id,
                    createdAt: timestamp ? timestamp.toDate() : new Date(),
                    uid: data.uid,
                    userInfo: userInfo || undefined,
                    ...data
                } as VerificationRequest;
            });

            const requestsList = await Promise.all(requestsListPromises);
            setRequests(requestsList);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching verification requests:", error);
            toast({ title: "Error", description: "Could not fetch payment requests.", variant: "destructive" });
            setLoading(false);
        });

        return () => unsubscribe();
    }, [toast]);

    const handleUpdateStatus = async (id: string, status: VerificationRequest['status']) => {
        try {
            const requestRef = doc(db, 'payment_verifications', id);
            await updateDoc(requestRef, { status });
            toast({
                title: "Status Updated",
                description: `The request has been marked as ${status}.`
            });
        } catch (error) {
            console.error("Error updating status:", error);
            toast({ title: "Error", description: "Could not update the request status.", variant: "destructive" });
        }
    };

    return (
        <div className="pt-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Payment Verification Requests</CardTitle>
                    <CardDescription>
                        Review and manage incoming payment verification requests from users.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-48">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="mt-4 text-muted-foreground">Loading requests...</p>
                        </div>
                    ) : requests.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Requested</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {requests.map(request => (
                                    <TableRow key={request.id}>
                                        <TableCell>
                                             <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={request.userInfo?.photoURL || undefined} alt={request.userInfo?.displayName || 'User'} />
                                                    <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium">{request.userInfo?.displayName || 'N/A'}</div>
                                                    <div className="text-xs text-muted-foreground">{request.userInfo?.email || 'No email on record'}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{request.productName}</TableCell>
                                        <TableCell className="font-semibold">{request.price}</TableCell>
                                        <TableCell title={request.createdAt ? format(request.createdAt, "PPP p") : ''}>
                                            {request.createdAt ? formatDistanceToNow(request.createdAt, { addSuffix: true }) : 'Just now'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant(request.status)} className="capitalize flex items-center gap-1 w-fit">
                                                {getStatusIcon(request.status)}
                                                {request.status}
                                            </Badge>
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
                                                    <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => handleUpdateStatus(request.id, 'verified')} disabled={request.status === 'verified'}>
                                                        <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                                        Mark as Verified
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleUpdateStatus(request.id, 'rejected')} disabled={request.status === 'rejected'} className="text-destructive focus:text-destructive">
                                                        <XCircle className="mr-2 h-4 w-4" />
                                                        Mark as Rejected
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="text-center text-muted-foreground py-10">No pending verification requests.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
