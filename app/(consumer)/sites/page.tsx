/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import Link from "next/link";
import {
  Plus,
  ExternalLink,
  Globe,
  Clock,
  FolderCog,
  AlertTriangle,
} from "lucide-react";

// Safe date formatter with fallback
function formatDate(dateValue: unknown): string {
  if (!dateValue) return "Unknown date";
  const date = new Date(dateValue as string | Date);
  if (isNaN(date.getTime())) return "Invalid date";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

// Defensive status badge lookup
function getStatusBadge(status?: string | null) {
  const safeStatus = (status ?? "UNKNOWN").toUpperCase();

  switch (safeStatus) {
    case "PUBLISHED":
    case "ACTIVE":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {safeStatus}
        </span>
      );
    case "DRAFT":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          <Clock className="w-3 h-3" />
          {safeStatus}
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
          {safeStatus}
        </span>
      );
  }
}

export default async function SitesListPage() {
  // 1. Edge Case: Enforce Authentication

  // 2. Edge Case: Isolated Database Fetching & Error Catching
  let sites: any = [];
  let dbError = false;

  try {
    sites = await prisma.site.findMany({
      where: {
        // Strictly scoped to authenticated user
        status: { not: "DELETED" },
      },
      select: {
        id: true,
        slug: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error(`[DB Error] Failed to fetch sites for users:`, error);
    dbError = true;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-gray-200 dark:border-gray-800 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Your Sites
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your deployed sites, sections, and site files.
          </p>
        </div>

        <Link
          href="/sites/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          <Plus className="w-4 h-4" />
          <span>New Site</span>
        </Link>
      </div>

      {/* 3. Edge Case: Database Outage / Query Failure UI */}
      {dbError ? (
        <div className="text-center py-12 px-4 rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 text-red-600 dark:text-red-400">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-80" />
          <h3 className="text-base font-semibold mb-1">
            Unable to load your sites
          </h3>
          <p className="text-sm opacity-80 max-w-sm mx-auto">
            We encountered an issue connecting to the database. Please refresh
            the page or try again later.
          </p>
        </div>
      ) : sites.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16 px-4 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4">
            <Globe className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
            No sites created yet
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
            Get started by creating your first site to manage sections and
            upload files.
          </p>
          <Link
            href="/sites/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create a site now
          </Link>
        </div>
      ) : (
        /* Sites Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sites.map((site: any) => {
            // 4. Edge Case: Missing or Malformed Slug Safeguard
            const safeSlug = site.slug || site.id;
            const sectionUrl = `/sections/${encodeURIComponent(safeSlug)}`;

            return (
              <div
                key={site.id}
                className="group relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 rounded-xl p-5 transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    {getStatusBadge(site.status)}

                    <a
                      href={sectionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1"
                      title="View Section"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                    <Link href={sectionUrl}>{safeSlug}</Link>
                  </h2>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-xs text-gray-500">
                  <span>Created {formatDate(site.createdAt)}</span>

                  <Link
                    href={`/site/${site.id}`}
                    className="inline-flex items-center gap-1.5 font-medium text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <FolderCog className="w-4 h-4" />
                    Manage Files
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
