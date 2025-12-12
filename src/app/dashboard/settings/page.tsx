
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 rounded-lg bg-card border shadow-sm h-96">
      <div className="bg-secondary p-6 rounded-full mb-6">
        <Settings className="h-12 w-12 text-primary" />
      </div>
      <h1 className="font-headline text-3xl font-bold tracking-tight">
        Settings Coming Soon
      </h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        We're working hard to bring you a comprehensive settings page. Soon, you'll be able to manage your account, preferences, and notifications right here.
      </p>
    </div>
  );
}
