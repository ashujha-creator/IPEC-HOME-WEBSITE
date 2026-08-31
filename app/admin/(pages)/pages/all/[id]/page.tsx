import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil, ImageOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPageById } from "@/lib/data/pages";
import { DeletePageButton } from "@/components/admin/delete-page-button";

export default async function PageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const page = await getPageById(id);

  if (!page) {
    notFound();
  }

  // content is stored as a plain markdown string in the Json column today.
  // Guard against unexpected shapes rather than assuming it's always a string.
  const contentText =
    typeof page.content === "string"
      ? page.content
      : JSON.stringify(page.content, null, 2);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header & Navigation */}
        <div className="flex flex-col gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <Link
            href="/admin/pages/all"
            className="inline-flex items-center text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to All Posts
          </Link>

          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-3xl font-bold tracking-tight">
                  {page.title}
                </h1>
                <Badge
                  variant={
                    page.status === "PUBLISHED" ? "default" : "secondary"
                  }
                >
                  {page.status}
                </Badge>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                By {page.author?.name || "Unknown author"} ·{" "}
                {new Date(page.createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                {page.updatedAt.getTime() !== page.createdAt.getTime() && (
                  <>
                    {" "}
                    · Updated{" "}
                    {new Date(page.updatedAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </>
                )}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                /blog/{page.slug}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Link
                  href={`/admin/pages/edit/${page.id}`}
                  aria-label="Edit post"
                >
                  <Pencil className="w-4 h-4" />
                </Link>
              </Button>
              <DeletePageButton
                pageId={page.id}
                pageTitle={page.title}
                redirectTo="/admin/pages/all"
              />
            </div>
          </div>
        </div>

        {/* Short Description */}
        {page.shortDescription && (
          <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            {page.shortDescription}
          </p>
        )}

        {/* Image Gallery */}
        {page.image.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {page.image.map((url, i) => (
              <div
                key={url}
                className="relative aspect-video rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800"
              >
                <Image
                  src={url}
                  alt={`${page.title} — image ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500 py-4">
            <ImageOff className="w-4 h-4" /> No images attached to this post.
          </div>
        )}

        {/* Body Content */}
        {contentText.trim() ? (
          <div className="prose dark:prose-invert max-w-none border-t border-slate-200 dark:border-slate-800 pt-6">
            <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed text-slate-800 dark:text-slate-200">
              {contentText}
            </pre>
          </div>
        ) : (
          <p className="text-sm text-slate-400 dark:text-slate-500 border-t border-slate-200 dark:border-slate-800 pt-6">
            No body content — this post is image-only.
          </p>
        )}
      </div>
    </div>
  );
}
