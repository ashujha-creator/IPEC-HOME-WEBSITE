// app/dashboard/sites/new/page.tsx
import Link from "next/link";
import { ArrowLeft, Globe2, ShieldCheck, Sparkles } from "lucide-react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UploadWizard } from "@/components/user-sites/upload-wizard";
import { headers } from "next/headers";

export default async function NewSitePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-muted/30">
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Back navigation */}
        <Link
          href="/sites"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sites
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border bg-background shadow-sm">
            <Globe2 className="h-5 w-5 text-primary" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Publish a new site
            </h1>

            <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Upload your site files, choose an address, and publish your
              project to the web.
            </p>
          </div>
        </div>

        {/* Publishing benefits */}
        <div className="mb-6 grid gap-3 sm:grid-cols-2">
          <div className="flex items-start gap-3 rounded-xl border bg-background/70 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>

            <div>
              <p className="text-sm font-medium">Simple publishing</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Upload your project and we&apos;ll handle the publishing flow.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border bg-background/70 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
            </div>

            <div>
              <p className="text-sm font-medium">Ready for production</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Your files are validated before your site is published.
              </p>
            </div>
          </div>
        </div>

        {/* Wizard */}
        <section
          aria-label="Site publishing wizard"
          className="rounded-2xl border bg-background p-5 shadow-sm sm:p-7"
        >
          <UploadWizard />
        </section>

        {/* Footer hint */}
        <p className="mt-5 text-center text-xs text-muted-foreground">
          You can review your site before publishing.
        </p>
      </div>
    </main>
  );
}
