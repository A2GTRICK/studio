
import { User } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 rounded-lg bg-card border shadow-sm h-96">
      <div className="bg-secondary p-6 rounded-full mb-6">
        <User className="h-12 w-12 text-primary" />
      </div>
      <h1 className="font-headline text-3xl font-bold tracking-tight">
        Profile Page Coming Soon
      </h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        We're building this page. Soon, you'll be able to manage your profile details, update your password, and view your account information here.
      </p>
    </div>
  );
}
