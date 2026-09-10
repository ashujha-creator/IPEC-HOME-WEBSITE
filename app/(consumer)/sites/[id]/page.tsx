// app/dashboard/sites/[id]/page.tsx
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { FileManager } from "@/components/user-sites/file-manager";
import { headers } from "next/headers";
export default async function ManageSitePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) redirect("/login");

  const site = await prisma.site.findUnique({
    where: { id },
    include: { files: { orderBy: { path: "asc" } } },
  });

  if (!site || site.ownerId !== session.user.id) notFound();

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="text-xl font-semibold mb-1">{site.slug}</h1>

      <a
        href={`/sections/${site.slug}`}
        target="_blank"
        rel="noreferrer"
        className="text-sm underline text-gray-500 mb-6 inline-block"
      >
        View live site →
      </a>

      <FileManager
        siteId={site.id}
        files={site.files.map((f) => ({
          path: f.path,
          size: f.size,
          contentType: f.contentType,
          updatedAt: f.updatedAt.toISOString(),
        }))}
      />
    </div>
  );
}
