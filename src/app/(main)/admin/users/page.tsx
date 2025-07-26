
'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, User, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// --- Hardcoded Admin User ID ---
const ADMIN_UID = 'sRiwSuQlxgbGRUcO7CevaJxQBEq2';
// -----------------------------

interface AppUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    // We can add more fields from Firestore later if needed
}

// NOTE: In a real production app, fetching users should be done via a secure backend function
// as listing users directly from the client is often restricted by security rules.
// For this prototype, we'll assume a simplified (and less secure) `users` collection exists.
// A more robust implementation would use Firebase Functions.

export default function AdminUsersPage() {
    const [users, setUsers] = useState<AppUser[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            // This is a placeholder. In a real app, you would have a 'users' collection
            // populated by a Firebase Function on user creation.
            // For now, we will simulate this by creating a mock user list.
            // In a real scenario, the query would be:
            // const usersSnapshot = await getDocs(collection(db, 'users'));
            // const usersList = usersSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as AppUser));
            
            const mockUsers: AppUser[] = [
                { uid: ADMIN_UID, email: 'admin@example.com', displayName: 'Admin User', photoURL: null },
                { uid: 'user123', email: 'student1@example.com', displayName: 'Priya Sharma', photoURL: null },
                { uid: 'user456', email: 'student2@example.com', displayName: 'Rahul Kumar', photoURL: null },
            ];

            setUsers(mockUsers);

        } catch (error) {
            console.error("Error fetching users:", error);
            // Handle error (e.g., show toast)
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    return (
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
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
