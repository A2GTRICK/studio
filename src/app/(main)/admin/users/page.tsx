
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, User, Shield, MoreHorizontal, Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


// --- Hardcoded Admin User ID ---
const ADMIN_UID = 'sRiwSuQlxgbGRUcO7CevaJxQBEq2';
// -----------------------------

interface AppUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<AppUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState<AppUser | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        setLoading(true);
        const usersCollection = collection(db, 'users');
        const q = query(usersCollection);
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const usersList = snapshot.docs.map(doc => doc.data() as AppUser);
            setUsers(usersList);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching users:", error);
            setLoading(false);
            toast({ title: "Error", description: "Could not fetch users.", variant: "destructive" });
        });

        return () => unsubscribe();
    }, [toast]);
    
    const handleUpdateUser = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingUser) return;
        setIsSubmitting(true);
        
        const formData = new FormData(e.currentTarget);
        const newDisplayName = formData.get('displayName') as string;

        try {
            const userRef = doc(db, 'users', editingUser.uid);
            await updateDoc(userRef, {
                displayName: newDisplayName,
            });
            toast({ title: "User Updated!", description: `Display name for ${editingUser.email} has been updated.` });
            setEditingUser(null);
        } catch (error) {
            console.error("Error updating user:", error);
            toast({ title: "Update Failed", description: "Could not update user details.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <>
        <div className="pt-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">User Management</CardTitle>
                    <CardDescription>View and manage all registered users in the application.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-48">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="mt-4 text-muted-foreground">Loading users...</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Display Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>User ID</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map(user => (
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
                                            {user.uid === ADMIN_UID ? (
                                                <Badge variant="destructive"><Shield className="mr-2 h-3 w-3" />Admin</Badge>
                                            ) : (
                                                <Badge variant="secondary"><User className="mr-2 h-3 w-3" />User</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="font-mono text-xs">{user.uid}</TableCell>
                                        <TableCell className="text-right">
                                             <Dialog onOpenChange={(open) => !open && setEditingUser(null)}>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">Actions</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DialogTrigger asChild>
                                                            <DropdownMenuItem onSelect={() => setEditingUser(user)}>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Edit User
                                                            </DropdownMenuItem>
                                                        </DialogTrigger>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                             </Dialog>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>

        <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit User</DialogTitle>
                    <DialogDescription>
                        Editing user roles or emails is not supported in this prototype. You can update the display name.
                    </DialogDescription>
                </DialogHeader>
                {editingUser && (
                    <form onSubmit={handleUpdateUser} className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="displayName">Display Name</Label>
                            <Input id="displayName" name="displayName" defaultValue={editingUser.displayName || ''} disabled={isSubmitting} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" defaultValue={editingUser.email || ''} disabled />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Input id="role" name="role" defaultValue={editingUser.uid === ADMIN_UID ? 'Admin' : 'User'} disabled />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditingUser(null)} disabled={isSubmitting}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
        </>
    );
}
