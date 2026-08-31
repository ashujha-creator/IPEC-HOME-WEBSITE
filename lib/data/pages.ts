import "server-only";
import { prisma } from "@/lib/prisma";
import { PageStatus } from "@/app/generated/prisma/enums";

export interface PageListItem {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  status: PageStatus;
  image: string[];
  createdAt: Date;
}

export interface PageDetail extends PageListItem {
  content: unknown; // Json column — markdown string today, per current design
  authorId: string;
  updatedAt: Date;
  author: {
    id: string;
    name: string | null;
  } | null;
}

export interface PaginatedPages {
  items: PageListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const DEFAULT_PAGE_SIZE = 12;

/**
 * Fetches a paginated list of pages, newest first.
 * Read-only — used directly inside Server Components.
 */
export async function getPages(options?: {
  page?: number;
  pageSize?: number;
  status?: PageStatus;
}): Promise<PaginatedPages> {
  const page = Math.max(1, options?.page ?? 1);
  const pageSize = options?.pageSize ?? DEFAULT_PAGE_SIZE;

  const where = options?.status ? { status: options.status } : {};

  const [items, total] = await Promise.all([
    prisma.page.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        title: true,
        slug: true,
        shortDescription: true,
        status: true,
        image: true,
        createdAt: true,
      },
    }),
    prisma.page.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/**
 * Fetches a single page by id, including author display info.
 * Returns null if not found — callers should trigger notFound() themselves.
 */
export async function getPageById(id: string): Promise<PageDetail | null> {
  const page = await prisma.page.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      slug: true,
      shortDescription: true,
      content: true,
      status: true,
      image: true,
      authorId: true,
      createdAt: true,
      updatedAt: true,
      author: {
        select: { id: true, name: true },
      },
    },
  });

  return page;
}
