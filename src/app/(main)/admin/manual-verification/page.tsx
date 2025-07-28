
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, updateDoc, doc, Timestamp, serverTimestamp } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, User, CheckCircle, Wrench, AlertTriangle, UserSearch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
    const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [productName, setProductName] = useState('');
    const [price, setPrice] = useState('');


    useEffect(() => {
        setLoading(true);
        // This query now fetches ALL users, so the admin can search for and manage anyone.
        const usersCollection = collection(db, 'users');
        const q = query(usersCollection);
        
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

    const handleManualApprove = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;
        
        setIsSubmitting(true);
        try {
             const userRef = doc(db, 'users', selectedUser.uid);
             await updateDoc(userRef, {
                 paymentRequest: {
                    productName: productName || "Manually Verified Purchase",
                    price: price || "N/A",
                    status: "verified",
                    requestedAt: serverTimestamp(),
                    verifiedAt: serverTimestamp()
                 }
             });
             toast({ title: 'User Approved!', description: `${selectedUser.displayName} has been manually verified and granted access.`});
             setSelectedUser(null); // Close the dialog
             setProductName('');
             setPrice('');
        } catch(error) {
             console.error("Error manually approving user:", error);
            toast({ title: "Update Failed", description: "Could not manually approve user.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const filteredUsers = users.filter(user => 
        searchQuery.trim() === '' || (
            user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

    return (
        <>
        <div className="pt-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <Wrench/>
                        Manual Verification Failsafe
                    </CardTitle>
                    <CardDescription>
                        This page is your master control for user access. You can see all registered users here. If a user's payment confirmation email arrives but their request doesn't appear in the main "Verifications" tab, search for them here by name or email and manually grant them access.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <Input 
                            placeholder="Search by name or email to filter the list..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-48">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="mt-4 text-muted-foreground">Loading user database...</p>
                        </div>
                    ) : filteredUsers.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Payment Status</TableHead>
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
                                        <TableCell>
                                            {user.paymentRequest?.status === 'verified' ? (
                                                <span className="text-green-600 font-semibold">Verified</span>
                                            ) : user.paymentRequest?.status === 'pending' ? (
                                                <span className="text-yellow-600 font-semibold">Pending</span>
                                            ) : (
                                                <span className="text-muted-foreground">Not Requested</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DialogTrigger asChild>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    disabled={user.paymentRequest?.status === 'verified'}
                                                    onClick={() => setSelectedUser(user)}
                                                >
                                                    <CheckCircle className="mr-2 h-4 w-4" />
                                                    {user.paymentRequest?.status === 'verified' ? 'Already Verified' : 'Manually Approve'}
                                                </Button>
                                            </DialogTrigger>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                         <div className="flex flex-col items-center justify-center h-48 text-center">
                            <UserSearch className="h-16 w-16 text-muted-foreground/30 mb-4" />
                            <h3 className="text-xl font-semibold">No Users Found</h3>
                            <p className="text-muted-foreground mt-2">Could not find any user matching your search query, or no users have registered yet.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
        
        <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive"/>Manual Approval for {selectedUser?.displayName}</DialogTitle>
                    <DialogDescription>
                        Grant access for a verified purchase. Specify what the user purchased below. This action should only be taken after you have independently verified their payment via email.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleManualApprove}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="productName">Product / Plan Name</Label>
                            <Input 
                                id="productName" 
                                value={productName} 
                                onChange={(e) => setProductName(e.target.value)}
                                placeholder="e.g., AI Notes Day Pass"
                                required
                            />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="price">Price (INR)</Label>
                            <Input 
                                id="price"
                                type="text"
                                value={price} 
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="e.g., 29"
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => setSelectedUser(null)}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Yes, grant access"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
        </>
    );
}
