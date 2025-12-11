
// src/app/a2gadmin/settings/page.tsx
import Link from 'next/link';

export default function AdminSettings() {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Admin Settings</h1>
        <p className="mb-6">Global settings and platform configuration will be managed here.</p>

        <div className="space-y-4">
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <h3 className="font-semibold">General Settings</h3>
                <p className="text-sm opacity-70">Site name, logos, and contact information.</p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <h3 className="font-semibold">API Keys</h3>
                <p className="text-sm opacity-70">Manage integrations with third-party services.</p>
            </div>
             <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <h3 className="font-semibold">Authentication</h3>
                <p className="text-sm opacity-70">Configure admin access and security settings.</p>
                 <Link href="/a2gadmin/logout" className="inline-block mt-3 px-4 py-2 text-sm bg-red-600 hover:bg-red-700 rounded-lg">
                    Logout
                </Link>
            </div>
        </div>
      </div>
    );
  }
  
