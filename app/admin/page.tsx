import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/ui/sign-out-button";

export default async function DashboardPage() {
  // 1. Retrieve the session on the server
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // 2. Fallback check (Middleware also protects this route)
  if (!session) {
    redirect("/login");
  }

  const { user } = session;

  return (
    <div className="min-h-screen bg-slate-50 p-8 dark:bg-slate-900 dark:text-slate-100">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Welcome back, {user.name || "User"}!
            </p>
          </div>
          <SignOutButton />
        </div>

        {/* User Details Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <h2 className="mb-4 text-lg font-semibold">Account Information</h2>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Full Name
              </dt>
              <dd className="text-sm font-medium">{user.name || "N/A"}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Email Address
              </dt>
              <dd className="text-sm font-medium">{user.email}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Email Verified
              </dt>
              <dd className="text-sm font-medium">
                {user.emailVerified ? "Yes" : "No"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
                User ID
              </dt>
              <dd className="text-sm font-mono">{user.id}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
