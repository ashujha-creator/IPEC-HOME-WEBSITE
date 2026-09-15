import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma"; // ⚠️ adjust to your actual Prisma client singleton
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic"; // always serve the latest publish, never a stale cache

const BUCKET = "page-media";

async function downloadText(storagePath: string) {
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .download(storagePath);

  if (error || !data) {
    throw new Error(
      `Failed to download ${storagePath}: ${error?.message ?? "no data"}`,
    );
  }

  return data.text();
}

function buildDocument(html: string, css: string, javascript: string) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <meta
    http-equiv="Content-Security-Policy"
    content="
      default-src 'none';
      img-src https: data: blob:;
      style-src 'unsafe-inline';
      script-src 'unsafe-inline';
      font-src https: data:;
    "
  />

  <style>
    ${css}
  </style>
</head>

<body>
  ${html}

  <script>
    ${javascript}
  </script>
</body>
</html>
`;
}

export default async function PlaygroundPublicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const playground = await prisma.playground.findUnique({
    where: { slug },
    include: { files: true },
  });

  if (!playground || playground.status !== "PUBLISHED") {
    notFound();
  }

  const htmlFile = playground.files.find((f) => f.path === "index.html");
  const cssFile = playground.files.find((f) => f.path === "style.css");
  const jsFile = playground.files.find((f) => f.path === "script.js");

  if (!htmlFile || !cssFile || !jsFile) {
    notFound();
  }

  const [html, css, javascript] = await Promise.all([
    downloadText(htmlFile.storagePath),
    downloadText(cssFile.storagePath),
    downloadText(jsFile.storagePath),
  ]);

  const document = buildDocument(html, css, javascript);

  return (
    <iframe
      title={playground.title ?? playground.slug}
      srcDoc={document}
      sandbox="allow-scripts"
      style={{ border: 0, width: "100vw", height: "100vh", display: "block" }}
    />
  );
}
