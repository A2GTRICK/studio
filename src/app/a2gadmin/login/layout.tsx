export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 via-indigo-800 to-black flex items-center justify-center p-4">
      {children}
    </div>
  );
}