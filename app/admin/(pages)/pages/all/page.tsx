import Link from "next/link";
import Image from "next/image";
import { Pencil, Eye, ImageOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPages } from "@/lib/data/pages";
import { DeletePageButton } from "@/components/admin/delete-page-button";

export default async function AllPagesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const currentPage = Math.max(1, Number(params.page) || 1);

  const { items, total, page, totalPages } = await getPages({
    page: currentPage,
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">All Posts</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {total} {total === 1 ? "post" : "posts"} total
            </p>
          </div>
          <Button>
            <Link href="/admin/pages/create">New Post</Link>
          </Button>
        </div>

        {/* Empty state */}
        {items.length === 0 && (
          <div className="text-center py-20 text-slate-500 dark:text-slate-400">
            No posts yet.{" "}
            <Link
              href="/admin/pages/create"
              className="underline underline-offset-2 hover:text-slate-800 dark:hover:text-slate-200"
            >
              Create your first one.
            </Link>
          </div>
        )}

        {/* Card Grid */}
        {items.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((p) => (
              <div
                key={p.id}
                className="group border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow flex flex-col"
              >
                <Link
                  href={`/admin/pages/all/${p.id}`}
                  className="relative aspect-video bg-slate-100 dark:bg-slate-800 block"
                >
                  {p.image[0] ? (
                    <Image
                      src={p.image[0]}
                      alt={p.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <ImageOff className="w-8 h-8" />
                    </div>
                  )}
                </Link>

                <div className="p-4 flex flex-col gap-2 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/admin/pages/all/${p.id}`}
                      className="font-semibold leading-snug hover:underline underline-offset-2 line-clamp-2"
                    >
                      {p.title}
                    </Link>
                    <Badge
                      variant={
                        p.status === "PUBLISHED" ? "default" : "secondary"
                      }
                      className="shrink-0"
                    >
                      {p.status}
                    </Badge>
                  </div>

                  {p.shortDescription && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                      {p.shortDescription}
                    </p>
                  )}

                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-auto pt-2">
                    {new Date(p.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 mt-2">
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <Link
                        href={`/admin/pages/all/${p.id}`}
                        aria-label={`View ${p.title}`}
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <Link
                        href={`/admin/pages/edit/${p.id}`}
                        aria-label={`Edit ${p.title}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                    </Button>
                    <DeletePageButton pageId={p.id} pageTitle={p.title} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}

                variant={p === page ? "default" : "outline"}
                size="icon"
                className="h-9 w-9"
              >
                <Link href={`/admin/pages/all?page=${p}`}>{p}</Link>
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
