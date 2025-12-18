
'use client';

import { useState } from 'react';
import { useAuthSession } from '@/auth/AuthSessionProvider';
import { useAuth } from '@/firebase/provider';
import { updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User } from 'lucide-react';

export default function ProfilePage() {
  const authSession = useAuthSession();
  const auth = useAuth();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState(authSession?.user?.displayName || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loadingName, setLoadingName] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  const user = authSession?.user;

  if (authSession?.loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user || !auth) {
    return (
      <div className="text-center">
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingName(true);
    try {
      await updateProfile(user, { displayName });
      toast({
        title: 'Success!',
        description: 'Your display name has been updated.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update display name.',
      });
    } finally {
      setLoadingName(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please fill in both password fields.',
      });
      return;
    }
    setLoadingPassword(true);

    try {
      const credential = EmailAuthProvider.credential(user.email!, currentPassword);
      // Re-authenticate before changing password for security
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      toast({
        title: 'Success!',
        description: 'Your password has been updated.',
      });
      setCurrentPassword('');
      setNewPassword('');
    } catch (error: any) {
        let errorMessage = 'Failed to update password. Please try again.';
        if (error.code === 'auth/wrong-password') {
            errorMessage = 'Incorrect current password. Please try again.';
        }
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
    } finally {
      setLoadingPassword(false);
    }
  };

  const userInitials = (user.displayName || user.email || 'U').substring(0, 2).toUpperCase();

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20 border-2 border-primary">
          <AvatarImage src={user.photoURL || undefined} alt={user.displayName || ''} />
          <AvatarFallback className="text-2xl">{userInitials}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            {user.displayName || 'Your Profile'}
          </h1>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your display name and personal details.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateName} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your Name"
              />
            </div>
            <Button type="submit" disabled={loadingName}>
              {loadingName && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Name
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your account password. You will be logged out after a successful change.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" disabled={loadingPassword}>
              {loadingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
