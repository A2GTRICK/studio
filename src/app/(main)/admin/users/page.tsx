
'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, User, Shield, MoreHorizontal, Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';


// --- Hardcoded Admin User ID ---
const ADMIN_UID = 'sRiwSuQlxgbGRUcO7CevaJxQBEq2';
// -----------------------------

interface AppUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
}

// NOTE: In a real production app, fetching users should be done via a secure backend function
// as listing users directly from the client is often restricted by security rules.
// For this prototype, we'll assume a simplified (and less secure) `users` collection exists.
// A more robust implementation would use Firebase Functions.

export default function AdminUsersPage() {
    const [users, setUsers] = useState<AppUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState<AppUser | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            // This is a placeholder. In a real app, you would have a 'users' collection
            // populated by a Firebase Function on user creation.
            // For now, we will simulate this by creating a mock user list.
            const mockUsers: AppUser[] = [
                { uid: ADMIN_UID, email: 'admin@example.com', displayName: 'Admin User', photoURL: null },
                { uid: 'user123', email: 'student1@example.com', displayName: 'Priya Sharma', photoURL: null },
                { uid: 'user456', email: 'student2@example.com', displayName: 'Rahul Kumar', photoURL: null },
            ];

            setUsers(mockUsers);

        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);
    
    const handleUpdateUser = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingUser) return;
        setIsSubmitting(true);
        
        const formData = new FormData(e.currentTarget);
        const updatedUser: AppUser = {
            ...editingUser,
            displayName: formData.get('displayName') as string,
        };

        // Simulate API call for prototype
        setTimeout(() => {
            setUsers(users.map(u => u.uid === updatedUser.uid ? updatedUser : u));
            toast({ title: "User Updated!", description: `Display name for ${updatedUser.email} has been updated.` });
            setEditingUser(null);
            setIsSubmitting(false);
        }, 500);
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
                                        <TableCell className="font-medium">{user.displayName || 'N/A'}</TableCell>
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
