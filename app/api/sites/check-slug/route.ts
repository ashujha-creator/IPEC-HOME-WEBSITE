// app/api/sites/check-slug/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugCheckSchema } from "@/lib/user-sites/schemas";
import { isValidSlug } from "@/lib/user-sites/reserved-slugs";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = slugCheckSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { available: false, error: "Invalid slug format" },
      { status: 400 },
    );
  }

  const { slug } = parsed.data;
  if (!isValidSlug(slug)) {
    return NextResponse.json({
      available: false,
      error: "Reserved or invalid slug",
    });
  }

  const existing = await prisma.site.findUnique({
    where: { slug },
    select: { id: true },
  });
  return NextResponse.json({ available: !existing });
}
