import { notFound } from "next/navigation";
import { getSiteBySlugCached } from "@/lib/user-sites/site-cache";
import SectionViewer from "./section-viewer";

export default async function SectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // 1. Database fetch (handled by loading.tsx on initial load)
  const site = await getSiteBySlugCached(slug);

  if (!site || site.status !== "ACTIVE") {
    notFound();
  }

  // 2. Render client viewer to handle iframe loading state
  return <SectionViewer slug={slug} />;
}
