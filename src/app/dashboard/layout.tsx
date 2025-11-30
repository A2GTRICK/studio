
import { FirebaseClientProvider } from "@/firebase/client-provider";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FirebaseClientProvider>
        <main className="flex-1 p-6">{children}</main>
    </FirebaseClientProvider>
  );
}
