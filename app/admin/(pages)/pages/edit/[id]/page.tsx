import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getPageById } from "@/lib/data/pages";
import { EditBlogForm } from "@/components/editor/edit-blog-form";

export default async function EditBlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !session.user) {
    notFound();
  }

  const page = await getPageById(id);
  if (!page) {
    notFound();
  }

  // Only the original author may edit — same rule updatePageAction enforces
  // server-side. Checking here too so a non-owner never even sees the form.
  if (page.authorId !== session.user.id) {
    notFound();
  }

  const initialContent = typeof page.content === "string" ? page.content : "";

  return (
    <EditBlogForm
      pageId={page.id}
      initialValues={{
        title: page.title,
        shortDescription: page.shortDescription || "",
        slug: page.slug,
        content: initialContent,
        images: page.image.map((url) => ({
          id: crypto.randomUUID(),
          url,
        })),
        status: page.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
      }}
    />
  );
}
