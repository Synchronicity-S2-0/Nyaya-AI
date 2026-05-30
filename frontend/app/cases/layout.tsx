import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut, LayoutDashboard } from "lucide-react";

export default async function CasesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link href="/cases" className="flex items-center text-xl font-bold text-gray-900 gap-2">
                <LayoutDashboard className="w-6 h-6 text-blue-600" />
                Nyaya AI
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600 font-medium">
                {session.user.name || session.user.email}
              </div>
              {/* Better Auth logout will need a client component, or we can just use a normal anchor for simplicity if there's a signout route, but usually it's client-side. We'll leave a placeholder or a client wrapper later if needed. */}
              <Link 
                href="/" 
                className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
                title="Return to Home"
              >
                <LogOut className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
